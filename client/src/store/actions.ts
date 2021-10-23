import {ActionTypes} from '../types/action-type'
import {MutationTypes} from '../types/mutation-type'
import {MessageTypes} from '../types/message-type'
import {MessageEvent} from '../models/message'
import { User } from '../models/user'
 
export const Actions = {
  [ActionTypes.join]({commit}, user : User): void {
    commit(MutationTypes.join, user)
  },
  [ActionTypes.leave]({commit}):void {
    commit(MutationTypes.leave)
  },
  [ActionTypes.forcedLeave]({commit}, noticeMessage: string):void {
    commit(MutationTypes.forcedLeave, noticeMessage)
  },
  [ActionTypes.setMessage]({commit}, messageEvent: MessageEvent):void {
    const currentMessage = messageEvent
    switch (messageEvent.type) {
      
      case MessageTypes.chat:
        break;
      case MessageTypes.leaveNotice:
        currentMessage.message = `${currentMessage.username} left`
        break
      case MessageTypes.joinedNotice:
        currentMessage.message = `${currentMessage.username} joined`
        break;
      default:
        console.log(`This message type is not recognized ${messageEvent.type}.`);
    }
  
    commit(ActionTypes.setMessage, currentMessage)
  }
}