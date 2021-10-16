<template>
  <div class="msg right-msg" v-if="self === message.username">
    <div class="msg-bubble">
      <div class="msg-info">
        <div class="msg-info-name">{{message.username}}</div>
        <div class="msg-info-time">{{dateFormated(message.sentAt)}}</div>
      </div>
      <div class="msg-text">
        {{message.message}}
      </div>
    </div>
  </div>
  <div class="msg left-msg" v-else>
    <div class="msg-bubble">
      <div class="msg-info">
        <div class="msg-info-name">{{message.username}}</div>
        <div class="msg-info-time">{{dateFormated(message.sentAt)}}</div>
      </div>
      <div class="msg-text">
        {{message.message}}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['message', 'self'],
  methods: {
    dateFormated(date){
      const hours = date.getHours()
      const mins = date.getMinutes()
      const formatted = `${(hours > 9)? hours:('0' + hours)}:${ mins > 9 ? mins: '0' + mins}`
      return formatted
    }
  }
}
</script>