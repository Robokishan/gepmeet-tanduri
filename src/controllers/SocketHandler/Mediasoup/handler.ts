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
import {
  MediaSoupSocket,
  SocketRPCType,
  UserState
} from '../../../utils/types';

import { MediaSoupCommand } from '../../../modules/rpc/handler';
import { em } from '../../../modules/orm';
import { User } from '../../../entities/User';
import { SessionDataType } from '../../../modules/liveDhokla/dhoklaStore/types';
import { rpcClient } from '../../../client/rabbitmq';
import {
  cleanupRoomHandler,
  registerMediasoupHandlers,
  removeRoomEvents
} from '..';

let last_selected_worker = 0;
const USER_ERROR = 'USER NOT ALLOWED';
const something_went_wrong = 'something went wrong';

// function onError(this: SocketRPCType) {
//   this.userState = UserState.ERROR;
// }

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

  this.userState = UserState.JOINING;
  const sessionData: SessionDataType = {
    workerId: worker,
    roomId: _data.roomId,
    userId: _data.userId,
    name: me.name
  };
  await saveSessiondata(this.id, sessionData);

  rpcClient.sendCommand(MediaSoupCommand.joinRoom, sessionData.workerId, [
    sessionData
  ]);

  // emit to mediasoup socket that room has been assigned so that transport can be created
  this.emit(MediaSoupSocket.roomAssigned);
  this.userState = UserState.JOINED;
  registerMediasoupHandlers(this);
  cleanupRoomHandler(this);
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
  if (!worker) {
    callback({ msg: 'no worker found' });
    this.userState = UserState.ERROR;
  } else {
    const res = await rpcClient.sendCommand(
      MediaSoupCommand.getRouterRtpCapabilities,
      sessionData.workerId
    );

    callback(res);
  }
}

export async function createProducerTransportHandler(
  this: SocketRPCType,
  _data: any,
  callback: any
) {
  if (this.userState === UserState.ERROR) {
    callback(USER_ERROR);
    return;
  }
  const sessionData = await getSessionData(this.id);
  try {
    const transportParams = await rpcClient.sendCommand(
      MediaSoupCommand.createProducerTransport,
      sessionData.workerId,
      [sessionData]
    );
    //get transport params from voice server
    callback(transportParams);
  } catch (error) {
    callback(something_went_wrong);
  }
}

export async function connectProducerTransportHandler(
  this: SocketRPCType,
  _data: any,
  callback: any
) {
  if (this.userState === UserState.ERROR) {
    callback(USER_ERROR);
    return;
  }
  const sessionData = await getSessionData(this.id);
  const { dtlsParameters } = _data;
  const connectProducerResponse = await rpcClient.sendCommand(
    MediaSoupCommand.connectProducerTransport,
    sessionData.workerId,
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
  if (this.userState === UserState.ERROR) {
    callback(USER_ERROR);
    return;
  }
  const sessionData = await getSessionData(this.id);
  const producerResponse: any = await rpcClient.sendCommand(
    MediaSoupCommand.produce,
    sessionData.workerId,
    [{ sessionData, produceMeta: _data }]
  );

  if (producerResponse?.id) {
    callback(producerResponse);
    this.to(sessionData.roomId).emit('newuserjoin', {
      roomId: sessionData.roomId,
      userId: sessionData.userId,
      name: sessionData.name,
      producerId: producerResponse.id
    });
  } else {
    callback(something_went_wrong);
  }
}

export async function createConsumerTransportHandler(
  this: SocketRPCType,
  _data: any,
  callback: any
) {
  if (this.userState === UserState.ERROR) {
    callback(USER_ERROR);
    return;
  }
  const sessionData = await getSessionData(this.id);
  try {
    const transportParams = await rpcClient.sendCommand(
      MediaSoupCommand.createConsumerTransport,
      sessionData.workerId,
      [sessionData]
    );
    //get transport params from voice server
    callback(transportParams);
  } catch (error) {
    callback(something_went_wrong);
  }
}

export async function connectConsumerTransportHandler(
  this: SocketRPCType,
  _data: any,
  callback: any
) {
  if (this.userState === UserState.ERROR) {
    callback(USER_ERROR);
    return;
  }
  const sessionData = await getSessionData(this.id);
  const { dtlsParameters } = _data;
  const connectConsumerResponse = await rpcClient.sendCommand(
    MediaSoupCommand.connectConsumerTransport,
    sessionData.workerId,
    [{ dtlsParameters, sessionData }]
  );

  callback(connectConsumerResponse);
}

export async function mediaconsumeHandler(
  this: SocketRPCType,
  _data: any,
  callback: any
) {
  if (this.userState === UserState.ERROR) {
    callback(USER_ERROR);
    return;
  }
  const sessionData = await getSessionData(this.id);
  const { rtpCapabilities } = _data;
  const mediaConsumerResponse = await rpcClient.sendCommand(
    MediaSoupCommand.consume,
    sessionData.workerId,
    [{ rtpCapabilities, sessionData }]
  );

  callback(mediaConsumerResponse);
}

export async function mediaUserConsumeHandler(
  this: SocketRPCType,
  _data: any,
  callback: any
) {
  if (this.userState === UserState.ERROR) {
    callback(USER_ERROR);
    return;
  }
  const sessionData = await getSessionData(this.id);
  const { rtpCapabilities } = _data;
  if (!_data.userId) throw new Error('Please provide userId');
  if (!(_data?.producerIds.length > 0))
    throw new Error('Please provide producerId');
  const mediaConsumerResponse = await rpcClient.sendCommand(
    MediaSoupCommand.consumeUser,
    sessionData.workerId,
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
        if (rpcClient) {
          try {
            await rpcClient.sendCommand(
              MediaSoupCommand.disconnect,
              sessionData.workerId,
              [{ sessionData }]
            );
          } catch (_err) {
            //error because of something related to rpc rabbitmq
          }
        }
      }
    }
    this.userState = UserState.JOINING;
    removeRoomEvents(this); //remove all listeners
    deleteSessionData(this.id); //remove session data
  }
}
