<template>
<div>
  <h2>Option Layout</h2>
  hello
  <h3>浏览记录2</h3>
  <router-link to="/history">浏览记录</router-link>
  <router-link to="/settings">设置</router-link>
  <router-view></router-view>

</div>
</template>

<script>
export default {
  name: "OptionLayout",

  components: {},

  data() {
    return {};
  },

  methods: {},

  computed: {},

  mounted() {}
};
</script>
