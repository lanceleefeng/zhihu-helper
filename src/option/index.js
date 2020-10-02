import Vue from "vue";
// import VueRouter from "vue-router";
// import App from "./components/Option.vue";
import App from "./App.vue";

// import insert from "@/utils/insert";
import stroe from "@/mixins/store";

// router 返回的是一个函数，要调用一次
import router from "./router";

Vue.mixin(stroe);

// content script 需要插入，
// option 页面本来就是 vue 组件，不需要插入了

// 插入组件到页面中
// insert(App);

new Vue({
  el: "#app",
  // router,
  router: router(),
  render: h => h(App)
});
