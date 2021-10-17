import { createStore } from 'vuex'
import { state, State } from './state'
import { Mutations } from './mutations'
import { Actions } from './actions'

export default createStore({
  state: state as State,
  mutations: Mutations,
  actions: Actions
})
