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
      store.dispatch(ActionTypes.JOIN, nickname)
    };
    return { join, nickname };
  }
});
</script>