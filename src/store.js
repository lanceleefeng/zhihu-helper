
import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    recent: [],
    history: [],
    option: {}
  },
  getters: {},
  mutations: {
    // addRecent(state, data){
    // },

    // todo: 初始化时取出数据

    addHistory(state, data){
      let newRecent = [];
      let newHistory = [];

      // console.log('old recent:', state.recent);

      state.recent.forEach(item => {

        // console.log(item);

        if (item.itemId !== data.itemId || item.type !== data.type){

          // todo: 检查时间是否已超过30min

          // 时间对象相减得到的是毫秒数
          let currentDate = new Date();
          let timePassed = currentDate - item.time;
          // console.log('time:', currentDate, item.time);
          // console.log('time passed:', timePassed);

          // if (Math.floor(Math.random() * 10000) % 2 === 0) {
          // if(false){

          if (timePassed > 1800000){
            newHistory.push(item);
          }else{
            newRecent.push(item);
          }
        }
      });

      newRecent.push(data);

      state.recent = newRecent;
      // console.log('new recent:', state.recent);

      // commit('addHistory', newHistory);
      if (newHistory.length){
        state.history.push(newHistory[0]);
      }

      // todo: 存入localStorage

      chrome.storage.local.set({recent: state.recent});

      // todo: 打开多个标签页时，防止数据覆盖
      // 每次保存前要先获取再保存？
      // 还是要在刷新、关闭时处理


    }
  },
  actions: {}
});
