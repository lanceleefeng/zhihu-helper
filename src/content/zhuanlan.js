import Vue from "vue";
import Zhuanlan from "./components/Zhuanlan.vue";
import insert from "@/utils/insert";
import store from "@/mixins/store";
import functions from "@/utils/functions";

Vue.use(functions);
Vue.mixin(store);

insert(Zhuanlan);

console.log("in zhuanlan.js");
