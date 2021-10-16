<template>
<div class="form-inline">
  <div class="form-group">
    <input
      type="text"
      placeholder="your nickname"
      class="form-control"
      v-model="nickname"
    />
    <br>
    <button class="btn btn-primary" @click="join">Join Chatroom</button>
  </div>
  <p>{{error.message}}</p>
  <!-- <div>{{$store.state}}</div> -->
</div>
</template>

<script>
export default {
  data() {
    return {
      nickname: '',
      error: {
        message: ''
      }
    }
  },
  methods: {
    join() {
      this.$store.dispatch('join', this.nickname)
    }
  }
}
</script>