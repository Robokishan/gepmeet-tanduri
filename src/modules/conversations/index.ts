import redis from '../../client/redis';

// same user can be in different room at the same time so that't why roomid required

const Roomset = {
  roomId: null,
  get getRoomset() {
    return this.roomId + ':WORKERS';
  }
};

const WorkerSet = {
  roomId: null,
  workerId: null,
  get getWorkerset() {
    return `${this.roomId}:${this.workerId}`;
  }
};

export const getWorkerId = async (roomId: string, userId: string) => {
  Roomset.roomId = roomId;
  const workers = await redis.smembers(Roomset.getRoomset);
  const worker = workers.find(async (workerId) => {
    WorkerSet.roomId = roomId;
    WorkerSet.workerId = workerId;
    const users: Array<string> = await redis.smembers(WorkerSet.getWorkerset);
    if (users.includes(userId)) {
      return worker;
    }
  });
};
