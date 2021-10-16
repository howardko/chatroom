import * as types from './mutation-types'
import * as mmessageTypes from '../types/message-types'

export const join = ({commit}, user) => {
  commit(types.JOIN, user)
}

export const leave = ({commit}) => {
  commit(types.LEAVE)
}

export const setMessages = ({commit}, messageEvent) => {
  let currentMessage = messageEvent

  switch (messageEvent.type) {
    case mmessageTypes.CHAT:
      break;
    case mmessageTypes.LEAVE_NOTICE:
      currentMessage.message = `${currentMessage.username} left`
      break
    case mmessageTypes.JOINED_NOTICE:
      currentMessage.message = `${currentMessage.username} joined`
      break;
    default:
      console.log(`This message type is not recognized ${messageEvent.type}.`);
  }

  commit(types.SET_MESSAGES, currentMessage)
}