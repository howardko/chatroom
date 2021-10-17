import {MessageTypes} from '../types/message-type';

export interface MessageEvent {
  type: MessageTypes;
  username: string;
  message: string;
  sentAt: Date;
}