<template>
  <div class="text-center pt-4 px-4">

    <button @click="getTest_1()" class="btn btn-success w-100">click me to get api test</button>
  </div>
</template>
<script>
export default {
  components: {

  },
  data() {
    return {
      hello: "hello world"
    }
  },
  methods: {
    async getApi() {
      const get_data = await this.$axios.$get('https://randomuser.me/api?results=1')
      console.log(get_data)
      alert("result in consol")
    },
    async getTest_1() {
      await this.$axios.$get('https://dummyjson.com/products').then(function(response){
        console.log(response)
      })
    },
    async postApi() {
      await axios.post('', formData, config)
        .then((response) => {
          console.log(response)
        }).catch((error) => {
          console.log(error);
        });
    },
  },
  mounted() {
    this.getTest_1()
  },
}
</script>
