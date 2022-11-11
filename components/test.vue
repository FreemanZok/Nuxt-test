<template>
  <div @click="alizoka()">
    count is :{{store.count}}
  </div>
</template>


<script>
import { store } from '../store/store.js';

export default{
  data(){
    return{
      store
    }
  },
  methods:{
    alizoka(){
      this.store.count= 5555
    }
  }
}

</script>
