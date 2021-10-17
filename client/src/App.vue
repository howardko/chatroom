<template>
  <router-view></router-view>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
// import { Vue } from 'vue-class-component';
import router from './router'
import store from './store'

export default defineComponent({
  name: 'App',
  watch: {
    '$store.state.user': function() :void{
      if (store.state.user.joined) {
        router.push('/chatroom')
      } else {
        router.replace('/join')
      }
    }
  },
  mounted(){
    router.replace('/join');
  }
})

// export default class App extends Vue {
//   watch: {
//     '$store.state.user': function():void {
//       if (store.state.user.joined) {
//         router.push('/chatroom')
//       } else {
//         router.replace('/join')
//       }
//     }
//   },
//   mounted(){
//     router.replace('/join');
//   }
// }

</script>