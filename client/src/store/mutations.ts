import {MutationTypes} from '../types/mutation-type'
import {MessageEvent} from '../models/message'
import { State } from './state'

export const Mutations = {
  [MutationTypes.join](state: State, nickname: string): void {
    state.user = {
        nickname: nickname,
        joined: true,
        noticeMessage: ''
    }
  },
  [MutationTypes.leave](state: State): void {
    state.user = {
        nickname: '',
        joined: false,
        noticeMessage: ''
      }
    state.messages.splice(0, state.messages.length);
  },
  [MutationTypes.forcedLeave](state: State, noticeMessage: string): void {
    state.user = {
        nickname: '',
        joined: false,
        noticeMessage: noticeMessage
      }
    state.messages.splice(0, state.messages.length);
  },
  [MutationTypes.setMessage](state: State, message: MessageEvent): void {
    state.messages.push(message)
  }
}