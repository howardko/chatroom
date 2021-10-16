import * as types from './mutation-types'

export const mutations = {
  [types.JOIN] (state, nickname) {
    state.user = {
      nickname: nickname,
      joined: true
    }
  },

  [types.LEAVE] (state) {
    state.user = {
      nickname: '',
      joined: false
    }
    state.messages = []
  },

  [types.SET_MESSAGES] (state, message) {
    // console.log("mutation set messages", message)
    state.messages.push(message)
  }
}