import Vue from "vue";
import Zhuanlan from "./components/Zhuanlan.vue";
import insert from "@/utils/insert";
import stroe from "@/mixins/store";

Vue.mixin(stroe);

insert(Zhuanlan);

console.log('in zhuanlan.js');



