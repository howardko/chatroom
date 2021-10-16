import Vue from 'vue'
import Vuex from 'vuex'
import { mutations } from './mutations'
import * as actions from './actions'
import * as messageTypes from '../types/message-types'

Vue.use(Vuex)

const state = {
  user: { 
    nickname: '',
    joined: false
  },
  messages: [
    // {
    //   type: messageTypes.JOINED_NOTICE,
    //   username: 'Howard',
    //   message: `Howard has joined`
    // },
    // {
    //   type: messageTypes.CHAT,
    //   username: 'Mary',
    //   message: "Welcome"
    // }
  ],
}

export default new Vuex.Store({
  state,
  mutations,
  actions
})