<template>

<div class="form-inline">
  <div class='content'>
    <!-- <div class="form-group">
      <input
        type="text"
        placeholder="your nickname"
        class="form-control"
        v-model="nickname"
        @keyup.enter="join"
      />
      <button class="btn btn-primary" @click="join">Join Chatroom</button>
    </div> -->

    <div class="msger-inputarea">
      <input type="text"
          placeholder="your nickname"
          class="form-control"
          v-model="nickname"
          @keyup.enter="join"
      />
      <button class="msger-send-btn" @click="join">Join Chatroom</button>
    </div>

    <div class="alert alert-danger alert-white rounded" v-if="this.$store.state.user.noticeMessage !== '' && this.$store.state.user.noticeMessage !== undefined">
      <button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>
      <div class="icon"><i class="fa fa-times-circle"></i></div>
      <strong>Error!</strong> {{this.$store.state.user.noticeMessage}}
    </div>
  </div>
  <!-- <div>{{$store.state}}</div> -->
</div>
</template>

<script lang="ts">
import store from '../store'
import {ActionTypes} from '../types/action-type'
import { defineComponent, ref } from "vue";
export default defineComponent({
  setup() {
    let nickname = ref("");
    const join = ():void => {
      store.dispatch(ActionTypes.join, nickname)
    };
    return { join, nickname };
  }
});
</script>