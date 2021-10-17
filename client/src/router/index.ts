import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Chatroom from '../components/Chatroom.vue'
import Join from '../components/Join.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/chatroom',
    name: 'chatroom',
    component: Chatroom
  },
  {
    path: '/join',
    name: 'join',
    component: Join
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
