import {ActionTypes} from '../types/action-type'
import {MutationTypes} from '../types/mutation-type'
import {MessageTypes} from '../types/message-type'
import {MessageEvent} from '../models/message'
import { User } from '../models/user'
 
export const Actions = {
  [ActionTypes.JOIN]({commit}, user : User): void {
    commit(MutationTypes.JOIN, user)
  },
  [ActionTypes.LEAVE]({commit}):void {
    commit(MutationTypes.LEAVE)
  },
  [ActionTypes.SET_MESSAGES]({commit}, messageEvent: MessageEvent):void {
    const currentMessage = messageEvent
    switch (messageEvent.type) {
      
      case MessageTypes.CHAT:
        break;
      case MessageTypes.LEAVE_NOTICE:
        currentMessage.message = `${currentMessage.username} left`
        break
      case MessageTypes.JOINED_NOTICE:
        currentMessage.message = `${currentMessage.username} joined`
        break;
      default:
        console.log(`This message type is not recognized ${messageEvent.type}.`);
    }
  
    commit(ActionTypes.SET_MESSAGES, currentMessage)
  }
}