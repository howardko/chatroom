import {MutationTypes} from '../types/mutation-type'
import {MessageEvent} from '../models/message'
import { State } from './state'

export const Mutations = {
  [MutationTypes.JOIN](state: State, nickname: string): void {
    state.user = {
        nickname: nickname,
        joined: true
    }
  },
  [MutationTypes.LEAVE](state: State): void {
    state.user = {
        nickname: '',
        joined: false
      }
    state.messages.splice(0, state.messages.length);

  },
  [MutationTypes.SET_MESSAGES](state: State, message: MessageEvent): void {
    state.messages.push(message)
  }
}