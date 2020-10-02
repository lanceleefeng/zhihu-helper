
import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

function timeStringToDate(rows) {
  if (!rows) return rows;

  // return rows;
  let transformed = [];
  rows.forEach(item => {
    let newItem = item;
    // newItem.time = JSON.parse(item.time);
    if ((typeof item.time) === "string"){
      newItem.time = new Date(item.time);
    }
    transformed.push(newItem);
  });
  console.log("transformed:", transformed);
  return transformed;
}

function dateToTimeString(rows) {
  if (!rows) return rows;

  // return rows;
  let transformed = [];
  rows.forEach(item => {
    let newItem = item;
    // newItem.time = JSON.parse(item.time);
    if (typeof item.time === "object") {
      newItem.time = item.time.toJSON();
    }
    transformed.push(newItem);
  });
  console.log("transformed:", transformed);
  return transformed;
}

function filterNewRecent(rows, oldRows, validTime) {
  // 只返回半个小时内没看过的
  // 半个小时内重复看同一个，视为一次浏览

  let newRecent = [];
  // let currentDate = new Date();

  // 因为可能重复，要找到最后

  rows.forEach(row => {
    let isInStorage = false;
    oldRows.forEach(oldRow => {
      let milliSeconds = row.time - oldRow.time;

      if (row.itemId === oldRow.itemId && row.type === oldRow.type) {
        if (milliSeconds <= validTime) {
          isInStorage = true;
        }
      }
    });

    if (!isInStorage) {
      newRecent.push(row);
    }
  });

  console.log("new records in 30 min:", newRecent);
  return newRecent;
}


export default new Vuex.Store({
  state: {
    cache: [],
    recent: [],
    history: [],
    option: {},
    pageSize: 20,
    batch: 100,
    max: 1000,
    validTime: 1800000
  },
  getters: {
    paginator: (state) => (n) => {
      console.log(n, state.history, state.history.length);

      n = n <= 0 ? 1 : n;
      let end = n * state.pageSize;
      let start = end - state.pageSize;

      start = start <= 0 ? 0 : start;
      if (start >= state.history.length) {
        return [];
      }

      let items = state.history.slice(start, end);
      console.log(items);
      return items;
    }
  },
  mutations: {

    addRecent(state, data){
      console.log("recent in state:", state.recent);
      console.log("new data:", data);

      let newRecent = [];
      // let newHistory = [];

      // console.log("old recent:", state.recent);

      let isInRecent = false;
      let currentDate = new Date();
      let validTime = state.validTime;
      // let batch = state.batch;

      for (let i in state.recent) {
        let item = state.recent[i];
        // console.log("item:", item);

        // if (item.itemId === data.itemId && item.type === data.type) {
        if ((item.itemId === data.itemId) && (item.type === data.type)) {
          // 时间对象相减得到的是毫秒数
          let timePassed = currentDate - item.time;
          console.log("timePassed:", timePassed);
          console.log("current date:", currentDate, "item.time:", item.time);
          // console.log("current date:", typeof currentDate, "item.time:", typeof item.time);

          if (timePassed <= validTime) {
            isInRecent = true;
            break;
          }
        }
      }
      // console.log(":", );
      console.log("isInRecent:", isInRecent);
      if (isInRecent) return;

      // 改为定时检查 cache 中的数量？
      // 只要有，每3秒保存一次

      state.cache.push(data);
      // commit("addCache", data);

      // state 中的 recent 和 storage 中的不同：

      // state中的recent只有最近半个小时的
      // storage中recent超过半小时的达到batch再保存到history中

      // if (state.recent) {
      if (state.recent.length > 0) {
        newRecent = state.recent;
      }

      newRecent.push(data);

      // state.recent = newRecent;
      // state.history.push(data);

      // console.log("new recent:", state.recent);
      // commit("addHistory", )
      // commit("setRecent", newRecent);

      // this 是 Store 对象
      console.log("this in mutation function:", this);
      // this.setRecent(state, newRecent);
      this.commit("setRecent", newRecent);

      // return;
    },

    addCache(state, data) {
      state.cache.push(data);
    },

    resetCache(state) {
      state.cache = [];
    },
    resetRecent(state) {
      state.recent = [];
    },
    setRecent(state, data) {
      console.log("new recent:", data);
      if (data) {

        let currentDate = new Date();
        let validTime = state.validTime;

        // 虽然 storage 中超过30分钟的100个才会保存到 history，
        // 但 state.recent 只保留半个小时内的

        let newRecent = [];
        data.forEach(item => {
          // 时间对象相减得到的是毫秒数
          let timePassed = currentDate - item.time;
          // console.log("time:", currentDate, item.time);
          // console.log("time passed:", timePassed);

          // if (Math.floor(Math.random() * 10000) % 2 === 0) {
          // if(false){
          if (timePassed <= validTime) {
            newRecent.push(item);
          }

        });
        state.recent = newRecent;
      }
    },
    addHistory(state, data) {
      console.log(state, data);
    },
    setHistory(state, data) {
      state.history = data;
    }
  },
  actions: {
    async flush({ state, commit, dispatch }) {
      console.log("state.cache.length:", state.cache.length);
      if (state.cache.length > 0) {
        let cache = state.cache;
        commit("resetCache");
        await dispatch("addRecentInStorage", cache);
      }
    },

    // async addHistory({ dispatch, state }, data){
    async addRecentInStorage({ dispatch, state }, data) {
      // let currentDate = new Date();
      let validTime = state.validTime;

      // data 从1条数据，变成了多条数据

      console.log("new recent batch:", data);

      // return;

      // todo: 存入localStorage

      // todo: 打开多个标签页时，防止数据覆盖
      // 每次保存前要先获取再保存？
      // 还是要在刷新、关闭时处理

      // 即使出现了打开多个浏览器标签的情况，影响也不大，实际中并不多

      // 解决了另一个问题：
      // 加载的时候不需要初始化了？

      // 保存也需要分成两部分：
      // recent 频繁修改；
      // history 仅仅在有超过半个小时的内容时再更新

      // 并发、同时修改就不考虑了

      let keyRecent = "recent";
      // let keyHistory = "history";

      /*

      // 清空 recent
      dispatch("clearRecent");
      return;

      // */

      // await chrome.storage.local.get([keyRecent], function(result){
      chrome.storage.local.get(keyRecent, function(result){
        console.log(keyRecent + " from storage:", result[keyRecent]);

        console.log(
          "type of recent:",
          typeof result[keyRecent],
          result[keyRecent]
        );

        if (result[keyRecent]) {

          // 把新的recent写入到storage

          let oldRecent = timeStringToDate(result[keyRecent]);

          // 再加一个批量更新：
          // recent 中超过半个小时的超过了100个，再保存到 history 中

          // 过滤超过半个小时的内容
          let newHistory = [];
          let remaining = [];
          let currentDate = new Date();

          for(let i in oldRecent) {

            let item = oldRecent[i];
            let milliSeconds = currentDate - item.time;

            if (milliSeconds > validTime) {
              newHistory.push(item);
            } else {
              remaining.push(item);
            }
          }

          let newRecent = filterNewRecent(data, oldRecent, validTime);

          // recent 超过30分钟的有100个之后，批量保存到 history
          if (newHistory.length >= state.batch) {
            // 更新 history
            dispatch("addHistoryInStorage", newHistory);

            // 更新 recent
            // remaining.push(data);
            if (newRecent.length > 0) {
              remaining = remaining.concat(newRecent);
            }
            dispatch("saveRecent", remaining);

          }else{
            // if (!isInStorage) {
            if (newRecent.length > 0) {
              // 更新 recent
              // oldRecent.push(data);
              oldRecent = oldRecent.concat(newRecent);
              dispatch("saveRecent", oldRecent);
            }
          }

        } else {
          // 更新 storage 中的 recent 改成单独的 action
          dispatch("saveRecent", data);
        }
      });

    },

    // async updateHistory({ dispatch, state }, data){
    async addHistoryInStorage({ dispatch, state }, data){

      // 时间控制在30天内，数量1000条？
      // 1000条，又有两种：
      // 一种是严格的1000条，history、recent加起来1000；
      // 另一个是模糊的1000，仅仅history中的，recent的随意，相当于1000+N

      let newNum = data.length;

      await chrome.storage.local.get(["history"], function(result){
        console.log("saved history: ", result.history);

        if (result.history) {
          let oldNum = result.history.length;
          // let i_start = oldNum + newNum - state.batch;
          let i_start = oldNum + newNum - state.max;

          let newHistory = [];

          // if (oldNum + newNum > state.batch) {
          // if (oldNum + newNum <= state.batch) {
          if (i_start <= 0) {
            newHistory = result.history;
          } else {
            newHistory = result.history.slice(i_start);
          }
          newHistory = newHistory.concat(data);
          dispatch("saveHistory", newHistory);
        } else {
          // dispatch("saveHistory", data);
          dispatch("saveHistory", data);
        }
      });

    },
    async saveHistory(context, data){

      data = dateToTimeString(data);

      await chrome.storage.local.set({ history: data }, function(){
        console.log("save history in storage.");
      });
    },
    async saveRecent(context, recent){

      recent = dateToTimeString(recent);

      // chrome.storage.local.set({ recent: recent }, function(){
      await chrome.storage.local.set({ recent: recent }, function(){
        console.log("save recent in storage.");
      });
    },

    async loadRecent({ commit }) {
      // 初始化时取出数据

      await chrome.storage.local.get(["recent"], function(result) {
        console.log("data from chrome.storage.local:", result.recent);
        let recent = timeStringToDate(result.recent);
        // console.log(recent);
        // commit('setRecentInitial', recent);
        // if (result.recent) {
        //   commit("setRecent", recent);
        // }
        commit("setRecent", recent);
      });
    },
    async loadHistory( { commit }){
      await chrome.storage.local.get("history", function(result) {
        console.log("data from chrome.storage.local:", result.history);
        let history = timeStringToDate(result.history);
        // console.log(recent);
        // commit('setRecentInitial', recent);
        // if (result.recent) {
        //   commit("setRecent", recent);
        // }
        commit("setHistory", history);
      });
    },
    showRecent({ state }) {
      console.log("显示 recent:");
      let key = "recent";
      // 除了显示 storage 中的，还有 state.recent
      console.log(state[key]);
      chrome.storage.local.get(key, function(result) {
        console.log(result[key]);
      });
    },
    showHistory() {
      console.log("显示 history:");
      let key = "history";
      chrome.storage.local.get(key, function(result) {
        console.log(result[key]);
      });
    },
    showAll({ dispatch }) {
      dispatch("showRecent");
      dispatch("showHistory");
    },
    clearRecent({ commit }) {
      console.log("清除 recent");
      // 同时要清除 state.recent、state.cache
      commit("resetRecent");
      commit("resetCache");
      chrome.storage.local.set({ recent: null });
    },
    clearHistory() {
      console.log("清除 history");
      chrome.storage.local.set({ history: null });
    },
    clearAll({ dispatch }) {
      dispatch("clearRecent");
      dispatch("clearHistory");
    }
  }

});
