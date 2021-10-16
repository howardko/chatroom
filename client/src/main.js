import Vue from 'vue'
import App from './components/App.vue'
import VueRouter from 'vue-router'
import store from './store'
import Chatroom from './components/Chatroom.vue'
import Join from './components/Join.vue'

Vue.use(VueRouter)
const router = new VueRouter({
  mode: 'history',
  routes: [
    { path: '/chatroom', component: Chatroom },
    { path: '/join', component: Join }
  ]
})

new Vue({
  el: '#app',
  router,
  store,
  mounted(){
    router.replace('/join')
  },
  watch: {
    '$store.state.user': function() {
      if (this.$store.state.user.joined) {
        router.push('/chatroom')
      } else {
        router.replace('/join')
      }
    }
  },
  render: h => h(App)
})