<template>
<section class="msger">
  <header class="msger-header">
    <div class="msger-header-title">
      <i class="fas fa-comment-alt"></i> Chatroom
    </div>
    <div class="msger-header-options">
      <span><i class="fas fa-cog"></i></span>
    </div>
  </header>
  <main class="msger-chat">
      <Message
        v-for="(message, index) in this.$store.state.messages"
        :message="message"
        :self="currentUser"
        :key="index"/>
  </main>
  <div class="msger-inputarea">
    <input type="text" class="msger-input" placeholder="Type something..." 
      v-model="currentMessage"
      @keyup.enter="sendMessage"
    />
    <button class="msger-send-btn" @click="sendMessage">Send</button>
    <button class="msger-leave-btn" @click="leave">Leave</button>
  </div>

  <!-- <div>{{$store.state}}</div> -->
  </section>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import Message from './Message.vue'
import {MessageTypes} from '../types/message-type'
import {ChannelTypes} from '../types/channel-type'
import {MessageEvent} from '../models/message'
import {ActionTypes} from '../types/action-type'
import store from '../store'
import {HOST} from '../configs/network'
import {SocketIOCon} from  '../service/socket.io'
export default defineComponent({
  components: {
    Message
  },

  setup() {
    console.log("env:", process.env)
    const socketIO = SocketIOCon(HOST)
    let currentUser = ref(store.state.user.nickname);
    let currentMessage = ref("");
    const leave = (): void => {
      const message: MessageEvent = {
        type: MessageTypes.LEAVE_NOTICE,
        username: store.state.user.nickname,
        sentAt: new Date(Date.now()),
        message: ""
      }
      socketIO.emit(ChannelTypes.MESSAGE_FROM_USER, message)
      socketIO.disconnect()
      store.dispatch(ActionTypes.LEAVE)
    };
    const sendMessage = (): void => {
      const message: MessageEvent = {
        type: MessageTypes.CHAT,
        username: store.state.user.nickname,
        message: currentMessage.value,
        sentAt: new Date(Date.now())
      }
     socketIO.emit(ChannelTypes.MESSAGE_FROM_USER, message)
      currentMessage.value = ""
    }
    onMounted(() => {
      socketIO.emit(ChannelTypes.MESSAGE_FROM_USER, {
        type: MessageTypes.JOINED_NOTICE,
        username: store.state.user.nickname,
        message: "",
        sentAt: new Date(Date.now())
      } as MessageEvent)
      socketIO.on(ChannelTypes.CHATROOM, (message: MessageEvent) => {
        console.log('received all messages')
        console.log(message)
        const date = new Date(message.sentAt)
        const received : MessageEvent = {
          type: message.type,
          username: message.username,
          sentAt: date,
          message: message.message
        }
        received.message = (message.message != undefined)? message.message: ""
        store.dispatch(ActionTypes.SET_MESSAGES, received)
      })
     })
    return { leave, sendMessage, currentUser, currentMessage };
  }
})
</script>