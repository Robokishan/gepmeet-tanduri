import {
  getNewPanchayatWorkers,
  getUserPanchayatWorker,
  saveUserPanchayatWorker
} from '../../../modules/panchayat';
import {
  getSessionData,
  saveSessiondata
} from '../../../modules/liveDhokla/dhoklaStore';
import { MediaSoupSocket, SocketRPCType } from '../../../utils/types';
import { startRPCClient } from '../../../modules/rpc';
import { MediaSoupCommand } from '../../../modules/rpc/handler';

let last_selected_worker = 0;

export async function startNegotiationHandler(
  this: SocketRPCType,
  _data: any,
  callback: any
) {
  const workers = await getNewPanchayatWorkers();
  if (!workers[last_selected_worker]) new Error('Worker not assigned');

  const worker = workers[last_selected_worker];

  callback(worker);
  // round robin algorithm to get new worker
  // TODO: PROPER METHOD BASED ON cpu consumption to select worker
  last_selected_worker += 1;
  last_selected_worker >= workers.length && (last_selected_worker = 0);

  // store session data in to redis
  // Todo: write session manager for socket.io
  saveUserPanchayatWorker(
    _data.roomId as string,
    worker,
    _data.userId as string
  );

  this.rpcClient = await startRPCClient(`panchayat:handshake:${worker}`);
  await saveSessiondata(this.id, {
    workerId: worker,
    roomId: _data.roomId,
    userId: _data.userId
  });
  // emit to mediasoup socket that room has been assigned so that transport can be created
  this.emit(MediaSoupSocket.roomAssigned);
}

export async function getRTPCapabilitiesHandler(
  this: SocketRPCType,
  _data: any,
  callback: any
) {
  const sessionData = await getSessionData(this.id);
  const worker = await getUserPanchayatWorker(
    sessionData.roomId,
    sessionData.userId
  );
  if (!worker) callback({ msg: 'no worker found' });
  else {
    const res = await this.rpcClient.sendCommand(
      MediaSoupCommand.getRouterRtpCapabilities
    );
    callback(res);
  }
}

export async function createProducerTransportHandler(
  this: SocketRPCType,
  _data: any,
  callback: any
) {
  const sessionData = await getSessionData(this.id);
  try {
    const transportParams = await this.rpcClient.sendCommand(
      MediaSoupCommand.createProducerTransport,
      [sessionData]
    ); //get transport params from voice server
    callback(transportParams);
  } catch (error) {
    callback('Something went wrong');
  }
}

export async function connectProducerTransportHandler(
  this: SocketRPCType,
  _data: any,
  callback: any
) {
  const sessionData = await getSessionData(this.id);
  const { dtlsParameters } = _data;
  const connectProducerResponse = await this.rpcClient.sendCommand(
    MediaSoupCommand.connectProducerTransport,
    [{ dtlsParameters, sessionData }]
  );
  callback(connectProducerResponse);
}

export async function mediaproduceHandler(
  this: SocketRPCType,
  _data: any,
  callback: any
) {
  const sessionData = await getSessionData(this.id);
  const producerResponse = await this.rpcClient.sendCommand(
    MediaSoupCommand.produce,
    [{ sessionData, produceMeta: _data }]
  );
  callback(producerResponse);
}

export async function createConsumerTransportHandler(
  this: SocketRPCType,
  _data: any,
  callback: any
) {
  const sessionData = await getSessionData(this.id);
  try {
    const transportParams = await this.rpcClient.sendCommand(
      MediaSoupCommand.createConsumerTransport,
      [sessionData]
    ); //get transport params from voice server
    callback(transportParams);
  } catch (error) {
    callback('Something went wrong');
  }
}

export async function connectConsumerTransportHandler(
  this: SocketRPCType,
  _data: any,
  callback: any
) {
  const sessionData = await getSessionData(this.id);
  const { dtlsParameters } = _data;
  const connectConsumerResponse = await this.rpcClient.sendCommand(
    MediaSoupCommand.connectConsumerTransport,
    [{ dtlsParameters, sessionData }]
  );
  callback(connectConsumerResponse);
}

export async function mediaconsumeHandler(
  this: SocketRPCType,
  _data: any,
  callback: any
) {
  const sessionData = await getSessionData(this.id);
  const { rtpCapabilities } = _data;
  const mediaConsumerResponse = await this.rpcClient.sendCommand(
    MediaSoupCommand.consume,
    [{ rtpCapabilities, sessionData }]
  );
  callback(mediaConsumerResponse);
}

export async function mediaResume(
  this: SocketRPCType,
  _data: any,
  callback: any
) {}
