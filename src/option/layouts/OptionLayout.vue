<template>
  <div>
    <h2>Option Layout</h2>
    hello
    <h3>浏览记录2</h3>
    <router-link class="menu-item" to="/history">浏览记录</router-link>
    <router-link class="menu-item" to="/settings">设置</router-link>
    <router-view></router-view>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "OptionLayout",

  components: {},

  data() {
    return {
      timer: null,
      timerInterval: 5000
    };
  },

  methods: {
    ...mapActions({
      loadAll: "loadAll"
    })
  },

  computed: {},

  mounted() {
    // this.loadAll();

    this.timer = setInterval(this.loadAll, this.timerInterval);
  },
  beforeDestroy() {
    clearInterval(this.timer);
    this.timer = null;
  }
};
</script>

<style lang="scss" scoped>
/*.menu-item:nth-last-child {*/
.menu-item {
  display: inline-block;
  margin-right:1rem;
}

</style>
