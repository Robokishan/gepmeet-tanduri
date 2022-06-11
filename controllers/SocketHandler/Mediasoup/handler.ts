import { Socket } from 'socket.io';
import {
  getNewPanchayatWorkers,
  getUserPanchayatWorker
} from '../../../modules/panchayat';
import { saveSessiondata } from '../../../modules/liveDhokla/dhoklaStore';
import { SocketRPCType } from '../../../utils/types';
import { startRPCClient } from '../../../modules/rpc';
import { MediaSoupCommand } from '../../../modules/rpc/handler';

let last_selected_worker = 0;
export async function startNegotiationHandler(
  this: SocketRPCType,
  _data: unknown,
  callback: any
) {
  const workers = await getNewPanchayatWorkers();
  const worker = workers[last_selected_worker]
    ? workers[last_selected_worker]
    : new Error('Worker not found');
  callback(worker);
  // round robin algorithm to get new worker
  // TODO: PROPER METHOD BASED ON cpu consumption to select worker
  last_selected_worker += 1;
  last_selected_worker >= workers.length && (last_selected_worker = 0);

  // store session data in to redis
  // Todo: write session manager for socket.io
  this.rpcClient = await startRPCClient(`panchayat:handshake:${worker}`);
  saveSessiondata(this.id, { worker });
}

export async function getRTPCapabilitiesHandler(
  this: SocketRPCType,
  data: unknown,
  callback: any
) {
  const worker = await getUserPanchayatWorker(
    (data as any).roomId,
    (data as any).userId
  );
  if (!worker) callback({ msg: 'no worker found' });
  else {
    const res = await this.rpcClient.sendCommand(
      MediaSoupCommand.getRouterRtpCapabilities
    );
    callback(res);
  }
}
