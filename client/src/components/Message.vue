<template>
  <div class="msg right-msg" v-if="me === message.username">
    <div class="msg-bubble">
      <div class="msg-info" v-if="message.type === 'CHAT'">
        <div class="msg-info-name" >{{message.username}}</div>
        <div class="msg-info-name" v-if="message.to !== ''">對 {{message.to}} 說</div>
        <div class="msg-info-name" v-else>說</div>
        <div class="msg-info-time">{{dateFormated(message.sentAt)}}</div>
      </div>
      <div class="msg-info" v-else>
        <div class="msg-info-time">{{dateFormated(message.sentAt)}}</div>
      </div>
      <div class="msg-text">
        {{message.message}}
      </div>
    </div>
  </div>
  <div class="msg left-msg" v-else>
    <div class="msg-bubble">
      <div class="msg-info" v-if="message.type === 'CHAT'" >
       <div class="msg-info-name" >{{message.username}}</div>
        <div class="msg-info-name" v-if="message.to !== ''">對 {{message.to}} 說</div>
        <div class="msg-info-name" v-else>說</div>
        <div class="msg-info-time">{{dateFormated(message.sentAt)}}</div>
      </div>
      <div class="msg-info" v-else>
        <div class="msg-info-time">{{dateFormated(message.sentAt)}}</div>
      </div>
      <div class="msg-text">
        {{message.message}}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import {MessageEvent} from '../models/message'
export default defineComponent({
  props: {
    message: {
      type: Object as PropType<MessageEvent>,
      required: true
    },
    me: {
      type: String,
      required: true
    }
  },
  setup() {
    const dateFormated = (date: Date): string => {
      const hours = date.getHours()
      const mins = date.getMinutes()
      const formatted = `${(hours > 9)? hours:('0' + hours)}:${ mins > 9 ? mins: '0' + mins}`
      return formatted
    }
    return {dateFormated};
  }
})
</script>