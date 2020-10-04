
import Vue from "vue";
import Vuex from "vuex";
import "chrome-storage-promise";

Vue.use(Vuex);

function timeStringToDate(rows) {
  if (!rows) return rows;

  // return rows;
  let transformed = [];
  rows.forEach(item => {
    let newItem = item;
    // newItem.time = JSON.parse(item.time);
    if (typeof item.time === "string") {
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
    filteredRecent: [],
    prevRecentNum: 0,
    recentNum: 0,
    recent: [],
    history: [],
    optionInitialized: false,
    // all: [],
    option: {},
    pageSize: 20,
    batch: 100,
    max: 1000,
    validTime: 1800000
  },
  getters: {
    all: state => {
      return state.history.concat(state.recent).reverse();
    },
    paginator: (state, getters) => n => {
      // console.log(n, state.history, state.history.length);
      // console.log(n, state.all, state.all.length);

      let all = getters.all;
      let allNum = all.length;

      console.log(n, all, all.length);

      n = n <= 0 ? 1 : n;
      let end = n * state.pageSize;
      let start = end - state.pageSize;

      start = start <= 0 ? 0 : start;
      if (start >= allNum) {
        return [];
      }

      let items = all.slice(start, end);
      console.log(items);
      return items;
    }
  },
  mutations: {
    setOptionInitialized(state, data) {
      state.optionInitialized = data;
    },
    addRecent(state, data) {
      console.log("recent in state:", state.recent);
      console.log("new data:", data);

      // let newRecent = [];
      // let newHistory = [];

      // console.log("old recent:", state.recent);

      let isInRecent = false;
      let currentDate = new Date();
      let validTime = state.validTime;
      // let batch = state.batch;

      let filteredRecent = state.filteredRecent;
      let filteredNum = filteredRecent.length;

      if (filteredNum > 0) {
        for (let i = 0; i < filteredNum; i++) {
          let item = filteredRecent[i];
          if (item.itemId === data.itemId && item.type === data.type) {
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

        console.log("isInRecent:", isInRecent);
        if (isInRecent) return;
      }

      // state.cache

      // state.cache.push(data);
      // commit("addCache", data);
      this.commit("addCache", data);

      // if (state.recent) {
      // if (state.recent.length > 0) {
      //   newRecent = state.recent;
      // }

      // newRecent.push(data);

      // state.recent = newRecent;
      // state.history.push(data);

      // console.log("new recent:", state.recent);
      // commit("addHistory", )
      // commit("setRecent", newRecent);

      // this 是 Store 对象
      console.log("this in mutation function:", this);
      // this.setRecent(state, newRecent);
      // this.commit("setRecent", newRecent);
      // this.commit("setRecent", newRecent);
      this.commit("addFilteredRecent", data);

      // storage 相关的操作，都在 actions

      // return;
    },

    addCache(state, data) {
      state.cache.push(data);
    },
    addFilteredRecent(state, data) {
      state.filteredRecent.push(data);
    },

    resetCache(state) {
      state.cache = [];
    },
    resetFilteredRecent(state) {
      state.filteredRecent = [];
    },
    resetRecent(state) {
      state.recent = [];
    },
    resetHistory(state) {
      state.history = [];
    },
    setFilteredRecent(state, data) {
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
        // state.recent = newRecent;
        state.filteredRecent = newRecent;
      }
    },
    setRecent(state, data) {
      state.prevRecentNum = state.recent.length;
      if (data) {
        state.recent = data;
        state.recentNum = state.recent.length;
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
      chrome.storage.local.get(keyRecent, function(result) {
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

          let oldNum = oldRecent.length;
          for(let i =0; i < oldNum; i++) {

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
          } else {
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
    async addHistoryInStorage({ dispatch, state }, data) {
      // 时间控制在30天内，数量1000条？
      // 1000条，又有两种：
      // 一种是严格的1000条，history、recent加起来1000；
      // 另一个是模糊的1000，仅仅history中的，recent的随意，相当于1000+N

      let newNum = data.length;

      await chrome.storage.local.get(["history"], function(result) {
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
    async saveHistory(context, data) {
      data = dateToTimeString(data);

      await chrome.storage.local.set({ history: data }, function() {
        console.log("save history in storage.");
      });
    },
    async saveRecent(context, recent) {
      recent = dateToTimeString(recent);

      // chrome.storage.local.set({ recent: recent }, function(){
      await chrome.storage.local.set({ recent: recent }, function() {
        console.log("save recent in storage.");
      });
    },

    async showRecent1({ state }) {
      // 除了显示 storage 中的，还有 state.recent

      console.log("显示 recent:");
      let key = "recent";
      console.log(state[key]);
      // let result = await chrome.storage.local.get(key, await function(result) {
      let result = await chrome.storage.local.get(key, function(result) {
        console.log(result[key]);
      });
      console.log("result of chrome.storage.local.get:", result);
    },
    async showHistory1() {
      console.log("显示 history:");
      let key = "history";
      await chrome.storage.local.get(key, function(result) {
        console.log(result[key]);
      });
    },
    showRecent({ state }) {
      // 除了显示 storage 中的，还有 state.recent

      console.log("显示 recent:");
      let key = "recent";
      console.log(state[key]);

      // 文件前面要加一句：
      // import "chrome-storage-promise";

      // console.log(chrome);
      console.log(chrome.storage);

      // 返回结果并没有改变 chrome.storage.local.get 原本的结构，
      // 仍然要用 key 从 result 中获取数据

      // chrome.storage.promise.local.get(key).then(items => {
      //   console.log(items);
      // });

      return chrome.storage.promise.local.get(key).then(result => {
        console.log(key + " from storage:", result[key]);
      });
    },
    showHistory() {
      console.log("显示 history:");
      let key = "history";
      return chrome.storage.promise.local.get(key).then(result => {
        console.log(key + " from storage:", result[key]);
      });
    },
    // showAll({ dispatch }) {
    async showAll({ dispatch }) {
      // 使用 Promise 之后，可以用 await 实现顺序执行
      // dispatch("showRecent");
      // dispatch("showHistory");

      await dispatch("showRecent");
      await dispatch("showHistory");

      // dispatch("showRecent").then(() => {
      //   dispatch("showHistory");
      // });
    },

    loadRecent({ commit }) {
      // 初始化时取出数据
      console.log("loadRecent");

      // await chrome.storage.local.get(["recent"], await function(result) {
      // await chrome.storage.local.get(["recent"], function(result) {
      return chrome.storage.promise.local.get(["recent"]).then(result => {
        console.log("data from chrome.storage.local:", result.recent);
        let recent = timeStringToDate(result.recent);
        // console.log(recent);
        // commit('setRecentInitial', recent);
        // if (result.recent) {
        //   commit("setRecent", recent);
        // }
        commit("setFilteredRecent", recent);
        commit("setRecent", recent);
      });
    },
    loadHistory({ commit }) {
      console.log("loadHistory");

      // return chrome.storage.promise.local.get("history", function(result) {
      return chrome.storage.promise.local.get("history").then(result => {
        console.log("data from chrome.storage.local:", result.history);
        let history = timeStringToDate(result.history);
        commit("setHistory", history);
      });
    },
    async loadAll({ state, commit, dispatch }) {
      // todo: 后面要添加选项的初始化
      if (!state.optionInitialized) {
        commit("setOptionInitialized", true);
        return dispatch("loadRecent").then(() => {
          dispatch("loadHistory");
          let log = "prev num: " + state.prevRecentNum + ", current num: " + state.recentNum;
          console.log(log);

        });
      } else {
        await dispatch("loadRecent");
        let log = "prev num: " + state.prevRecentNum + ", current num: " + state.recentNum;
        console.log(log);
        if (state.prevRecentNum > state.recentNum) {
          await dispatch("loadHistory");
        }
      }
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
    async clearAll({ dispatch }) {
      await dispatch("clearRecent");
      await dispatch("clearHistory");
    }
  }
});
