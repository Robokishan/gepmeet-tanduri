export const __prod__ = process.env.NODE_ENV === 'production';
export const REDIS_KEY_SOCKET_PREFIX = 'SOCKET_STORE:';
export const ROOM_EXCHANGE = 'roomexchange';
export const QUEUE_ROOM_EVENTS = 'roomeventsQueue';
export const PANCHAYAT_EXCHANGE = 'panchayat:handshake:exchange';
export enum CookieKeys {
  REFRESH_TOKEN = 'qid'
}
