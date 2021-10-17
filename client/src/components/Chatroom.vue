<template>
<section class="msger">
  <header class="msger-header">
    <div class="msger-header-title">
      <i class="fas fa-comment-alt"></i> Howard's Chatroom
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
    <button class="btn btn-danger btn-sm msger-send-btn" @click="leave">Leave</button>
  </div>

  <!-- <div>{{$store.state.messages}}</div> -->
  </section>
</template>

<script>
import Message from './Message.vue'
import * as messageTypes from '../types/message-types'
import * as channelNames from '../types/channel-names'
import * as Configs from '../config'
import {SocketIOCon} from  '../service/socket.io.js'
// import SocketIO from 'socket.io-client'
export default {
  data() {
    return {
      currentUser: this.$store.state.user.nickname,
      currentMessage: '',
      socketIO: SocketIOCon(Configs.HOST)
    }
  },
  methods: {
    leave() {
      this.socketIO.emit(channelNames.MESSAGE_FROM_USER, {
        type: messageTypes.LEAVE_NOTICE,
        username: this.$store.state.user.nickname,
        sentAt: Date.now()
      })
      this.socketIO.disconnect()
      this.$store.dispatch('leave')
    },
    sendMessage() {
      this.socketIO.emit(channelNames.MESSAGE_FROM_USER, {
        type: messageTypes.CHAT,
        username: this.$store.state.user.nickname,
        message: this.currentMessage,
        sentAt: Date.now()
      })
      this.currentMessage = ""
    }
  },
  components: {
    Message
  },
  mounted() {
    this.socketIO.emit(channelNames.MESSAGE_FROM_USER, {
        type: messageTypes.JOINED_NOTICE,
        username: this.$store.state.user.nickname,
        sentAt: Date.now()
    })
    this.socketIO.on(channelNames.CHATROOM, message => {
        console.log('received all messages')
        console.log(message)
        const date = new Date(+message.sentAt)
        let received = {
          type: message.type,
          username: message.username,
          sentAt: date,
        }
        received.message = (message.message != undefined)? message.message: ""
        this.$store.dispatch('setMessages', received)
    })
  }
}
</script>