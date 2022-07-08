import {
  deleteUserPanchayatWorker,
  getNewPanchayatWorkers,
  getUserPanchayatWorker,
  saveUserPanchayatWorker
} from '../../../modules/panchayat';
import {
  deleteSessionData,
  getSessionData,
  saveSessiondata
} from '../../../modules/liveDhokla/dhoklaStore';
import { MediaSoupSocket, SocketRPCType } from '../../../utils/types';
import { startRPCClient } from '../../../modules/rpc';
import { MediaSoupCommand } from '../../../modules/rpc/handler';
import { startRoomSubscribers } from '../../../modules/subscribers';
import { em } from '../../../modules/orm';
import { User } from '../../../entities/User';
import { SessionDataType } from '../../../modules/liveDhokla/dhoklaStore/types';

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
  await saveUserPanchayatWorker(
    _data.roomId as string,
    worker,
    _data.userId as string,
    this.id
  );
  const user = await em.getRepository(User);
  const me = await user.findOne({ id: _data.userId });

  this.rpcClient = await startRPCClient(`panchayat:handshake:${worker}`);
  const sessionData: SessionDataType = {
    workerId: worker,
    roomId: _data.roomId,
    userId: _data.userId,
    name: me.name
  };
  await saveSessiondata(this.id, sessionData);

  this.rpcClient.sendCommand(MediaSoupCommand.joinRoom, [sessionData]);

  // wrong logic because of multiple users in same room
  await startRoomSubscribers(_data.roomId);
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
  this.join(sessionData.roomId);
  this.to(sessionData.roomId).emit('notifyuserentered', {
    name: sessionData.name
  });
}

export async function mediaproduceHandler(
  this: SocketRPCType,
  _data: any,
  callback: any
) {
  const sessionData = await getSessionData(this.id);
  const producerResponse: any = await this.rpcClient.sendCommand(
    MediaSoupCommand.produce,
    [{ sessionData, produceMeta: _data }]
  );
  callback(producerResponse);

  this.to(sessionData.roomId).emit('newuserjoin', {
    roomId: sessionData.roomId,
    userId: sessionData.userId,
    name: sessionData.name,
    producerId: producerResponse.id
  });
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

export async function mediaUserConsumeHandler(
  this: SocketRPCType,
  _data: any,
  callback: any
) {
  const sessionData = await getSessionData(this.id);
  const { rtpCapabilities } = _data;
  if (!_data.userId) throw new Error('Please provide userId');
  if (!(_data?.producerIds.length > 0))
    throw new Error('Please provide producerId');
  const mediaConsumerResponse = await this.rpcClient.sendCommand(
    MediaSoupCommand.consumeUser,
    [
      {
        rtpCapabilities,
        sessionData,
        userId: _data.userId,
        producerIds: _data.producerIds
      }
    ]
  );
  callback(mediaConsumerResponse);
}

export async function mediaResume(
  this: SocketRPCType,
  _data: any,
  callback: any
) {}

export async function roomOnUserDrag(
  this: SocketRPCType,
  _data: any,
  callback: any
) {
  const sessionData = await getSessionData(this.id);
  this.to(sessionData.roomId).emit('drag', _data);
}

export async function handlerDisconnect(this: SocketRPCType, err: unknown) {
  //  disconnect and cleanup function should be more clear

  const sessionData = await getSessionData(this.id);

  if (sessionData) {
    this.to(sessionData.roomId).emit('userleft', {
      userId: sessionData.userId,
      name: sessionData?.name
    });
    this.leave(sessionData.roomId);
    if (sessionData?.roomId && sessionData?.userId) {
      const worker = await getUserPanchayatWorker(
        sessionData.roomId,
        sessionData.userId
      );
      if (worker) {
        await deleteUserPanchayatWorker(
          sessionData.roomId,
          worker,
          sessionData.userId
        ); //delete room details
        if (this.rpcClient) {
          try {
            await this.rpcClient.sendCommand(MediaSoupCommand.disconnect, [
              { sessionData }
            ]);
          } catch (_err) {
            //error because of something related to rpc rabbitmq
          }
        }
      }
    }
    if (this.rpcClient) {
      try {
        await this.rpcClient.disconnect(); //disconnect rpc client
      } catch (_err) {
        //error because of something related to rpc rabbitmq
      } finally {
        this.rpcClient = null;
      }
    }
    deleteSessionData(this.id); //remove session data
  }
}
