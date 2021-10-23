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
        :me="currentUser"
        :key="index"/>
  </main>
  <div class="msger-inputarea">
    <input type="text" class="msger-input" placeholder="Type something..." 
      v-model="currentMessage"
      @keyup.enter="sendMessage"
    />
    <input type="text" class="msger-input-2" placeholder="To who... (empty if to all)" 
      v-model="to"
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
import {CommandTypes} from '../types/command-type'
import {MessageEvent} from '../models/message'
import {Command} from '../models/command'
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
    let to = ref("");
    const leave = (): void => {
      const message: MessageEvent = {
        type: MessageTypes.leaveNotice,
        username: store.state.user.nickname,
        sentAt: new Date(Date.now()),
        isPrivate: false,
        to: "",
        message: ""
      }
      socketIO.emit(ChannelTypes.chatroom, message)
      socketIO.disconnect()
      store.dispatch(ActionTypes.leave)
    };
    const sendMessage = (): void => {
      const message: MessageEvent = {
        type: MessageTypes.chat,
        username: store.state.user.nickname,
        message: currentMessage.value,
        isPrivate: (to.value !="")? true : false,
        to: to.value,
        sentAt: new Date(Date.now())
      }
     socketIO.emit(ChannelTypes.chatroom, message)
      currentMessage.value = ""
      to.value = ""
    }
    onMounted(() => {
      socketIO.emit(ChannelTypes.chatroom, {
        type: MessageTypes.joinedNotice,
        username: store.state.user.nickname,
        message: "",
        isPrivate: false,
        to: "",
        sentAt: new Date(Date.now())
      } as MessageEvent)
      socketIO.on(ChannelTypes.chatroom, (message: MessageEvent) => {
        console.log('received a message', message)
        const date = new Date(message.sentAt)
        const received : MessageEvent = {
          type: message.type,
          username: message.username,
          sentAt: date,
          message: message.message,
          isPrivate: message.isPrivate,
          to: message.to,
        }
        received.message = (message.message != undefined)? message.message: ""
        store.dispatch(ActionTypes.setMessage, received)
      })
      socketIO.on(ChannelTypes.command, (command: Command) => {
        console.log('received a command', command)
        if(command.type === CommandTypes.forcedLeave) {
          socketIO.disconnect()
          store.dispatch(ActionTypes.forcedLeave, command.message)
        }
      })
     })
    return { leave, sendMessage, currentUser, currentMessage, to };
  }
})
</script>