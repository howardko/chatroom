import {MessageTypes} from "./message-types";

export interface MessageEvent {
    type: string;
    username: string;
    message: string;
    sentAt: Date;
    toString(): string;
  }

// https://stackoverflow.com/questions/53128744/typescript-automatically-get-interface-properties-in-a-class
export interface ChatBoardMessage extends MessageEvent { }
export class ChatBoardMessage implements MessageEvent {
    constructor (event: MessageEvent) {
        Object.assign(this, event, {})
      }

    toString(): string {
      if (this.type == MessageTypes.chat){
        return `${this.username}: ${this.message}`
      }else if (this.type == MessageTypes.joined_notice){
        return `${this.username} joined`
      }else {
        return `${this.username} left`
      }
    }
}