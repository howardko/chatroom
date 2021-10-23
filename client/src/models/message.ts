import {MessageTypes} from '../types/message-type';

export interface MessageEvent {
  type: MessageTypes;
  username: string;
  message: string;
  to: string;
  isPrivate: boolean;
  sentAt: Date;
}