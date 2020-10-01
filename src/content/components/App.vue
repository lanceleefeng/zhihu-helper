<template>
  <div class="greet">
    hello
    <div class="show-button-container">
      <button type="button" class="show" @click="showRecent">打印 recent</button>
      <button type="button" class="show" @click="showHistory">打印 history</button>
      <button type="button" class="show" @click="showAll">打印 all</button>
    </div>

    <div class="clear-button-container">
      <button type="button" class="clear clear-recent" @click="clearRecent">清除 recent</button>
      <button type="button" class="clear clear-history" @click="clearHistory">清除 history</button>
      <button type="button" class="clear clear-all" @click="clearAll">清除 all</button>
    </div>

  </div>
</template>

<script>

import { mapMutations, mapActions } from 'vuex';

export default {
  name: "App",

  components: {},

  data() {
    return {
      timer: null,
      timerInterval: 3000,
      type: null,
      urlType: null,
      intersectionObserver: null,
      domObserver: null,
      indexContainerDomObserver: null,

      // 超过 minRatio 的就记录为浏览过的
      // minRatio: 0.01,
      minRatio: 0.03,

      indexTypePrefix: "Topstory-",

      indexType: null,
      indexTypes: ["recommend", "follow", "hot", "room"],
      // indexTypeMap: {
      //   "Topstory-recommend": "recommend",
      //   "Topstory-follow": "follow",
      //   "Topstory-hot": "hot"
      // },

      // #TopstoryContent > div > div
      indexContainerSelector: "#TopstoryContent",
      // indexContainerSelector: "#TopstoryContent > .ListShortcut",
      // indexContainerSelector: "#TopstoryContent > .ListShortcut > div",
      indexContainerSub: " > .ListShortcut > div",

      root: null,
      // containerSelector: null,
      // containerSelector: ".List",

      // 回答页面，.MoreAnswers也是动态插入的，父级是 .Question-mainColumn
      containerSelector: {
        // answer: ".MoreAnswers > .List"
        // answer: ".MoreAnswers"
        answer: ".Question-mainColumn"
      },
      moreAnswerCssClass: "MoreAnswers",
      moreAnswerSelector: ".List-item",
      infoSelector: ".ContentItem",

      // targetSelector: ".List-item",

      targetSelector: {
        recommend: ".TopstoryItem",
        follow: ".TopstoryItem",
        hot: ".HotItem",
        // answer: ".List-item,.AnswerCard",
        answer: ".AnswerCard",
        question: ".List-item"
      },

      // thresholdNum: 20,
      thresholdNum: 25,
      // thresholdNum: 50,
      // thresholdNum: 100,
      observerOptions: {}

    };
  },

  computed: {
    indexInnerContainerSelector: function () {
      return this.indexContainerSelector + this.indexContainerSub;
    },
    actualTargetSelector: function () {
      let index = this.indexType ? this.indexType : this.urlType;
      let selector = this.targetSelector[index];
      console.log("actual target selector:", selector);
      return selector;
    }
  },

  methods: {

    // 首页上回答、问题、文章需要用定时器不断检查

    // 也有监控 DOM 树是否变化的接口，可以代替定时检查
    ...mapMutations({
      addRecent: "addRecent"
    }),
    ...mapActions({
      // addHistory: "addHistory",
      loadRecent: "loadRecent",

      showRecent: "showRecent",
      showHistory: "showHistory",
      showAll: "showAll",

      clearRecent: "clearRecent",
      clearHistory: "clearHistory",
      clearAll: "clearAll"
    }),
    flushCache(){
      this.$store.dispatch("flush");
    },
    createObserver(){

      this.createIntersectionObserver();

      let urlType = this.detectUrlType();

      if (!urlType) return;

      this.urlType = urlType;

      // if (urlType === "index" || urlType === "follow" || urlType === "hot") {
      // if (urlType === "index" || urlType === "follow" || urlType === "hot" || urlType === 'room') {
      if (this.indexTypes.includes(urlType)) {
        this.createIndexContainerDomObserver();
        this.observeInitial();
      } else if (urlType === "question") {

        // this.createIntersectionObserver();
        this.observeInitial();

        this.createDomObserver();


      } else if (urlType === "answer") {
        // 回答的页面结构与问题相似
        // 指定的回答也是用了同样的css class
        // ”更多回答“仅有两个，不需要监控dom变化了

        // 需要监控，更多中的回答是后来获取的，需要监控DOM变化来添加 intersection 监控
        // 还有问题，moreAnswers区域作为一个回答监控了

        // this.createIntersectionObserver();
        this.observeInitial();

        this.createDomObserver();

      }

    },
    createIndexContainerDomObserver() {
      let containerElement = document.querySelector(this.indexContainerSelector);
      console.log(containerElement);

      if (!containerElement) return;

      // let options = { childList: true, subtree: false, attributes: false };
      // let options = { childList: true, attributes: false, subtree: false };
      // let options = { childList: true, attributes: true, subtree: false };

      let options = { childList: true, attributes: false, subtree: true };

      this.indexContainerDomObserver = new MutationObserver(this.handleIndexContainerDomMutation);
      this.indexContainerDomObserver.observe(containerElement, options);

    },

    handleIndexContainerDomMutation(mutationList){

      // 区分首页类型：推荐、关注、热榜；
      this.detectIndexType();

      // 过滤元素，添加 intersection 监控
      // this.observe(addedNodes);

      // console.log(observer);
      console.log("new list items: ");
      console.log(mutationList);
      // console.log(mutationList[0]);
      // console.log(mutationList[0].addedNodes);

      let addedNodes = [];
      let targetSelector = this.targetSelector[this.indexType];
      let targetCssClass = targetSelector.replace(".", "");

      mutationList.forEach((item) => {
        // addedNodes.concat(item.addedNodes);
        item.addedNodes.forEach((nodeItem) => {
          // addedNodes.push(nodeItem);

          // if (nodeItem.classList.contains(targetSelector)) {
          if (nodeItem.classList && nodeItem.classList.contains(targetCssClass)) {
            addedNodes.push(nodeItem);
          }

        });
      });

      console.log("新增 intersection 监控：" + addedNodes.length + "个");
      this.observe(addedNodes);

    },

    detectUrlType() {

      let type;

      console.log(document.location.href);
      let url = document.location.href;

      let index_url = "https://www.zhihu.com/";

      url = url.replace(index_url, "");

      let urlParts = url.split("/");

      if (url === "") {
        // type = "index";
        type = "recommend";
      } else if (url === "follow") {
        type = "follow";
      } else if (url === "hot") {
        type = "hot";
      } else {

        let part1 = urlParts[0];

        if (part1 === "question") {
          if (2 in urlParts) {
            let sub = urlParts[2];

            if (sub === "answer") {
              type = "answer";
            } else if (sub === "p") {
              type = "article";
            }
          } else {
            type = "question";
          }

        } else if (part1 === "room") {
          type = "room";
        }

      }

      console.log("url type:", type);
      return type;

    },
    detectIndexType() {
      let innerContainer = document.querySelector(this.indexInnerContainerSelector);

      if (!innerContainer) return;

      // console.log(innerContainer);
      // console.log(innerContainer.className);
      // console.log(innerContainer.classList);

      let indexType;
      for (let i in this.indexTypes) {
        let type = this.indexTypes[i];
        let typeCssClass = this.indexTypePrefix + type;

        if (innerContainer.classList.contains(typeCssClass)) {
          indexType = type;
          break;
        }
      }
      console.log("index type:", indexType);
      if (indexType) {
        this.indexType = indexType;
      }

    },

    createIntersectionObserver() {

      // let intersectionObserver;
      let thresholds = this.getThreshold();

      // 不应该使用包含 .List-item 的 .List：
      // 回答与回答列表的 Intersection 并不会变化，而是与当前可视窗口 viewport 的 Intersection 会变化
      // 因此 root 要用 null

      // let rootElement = this.containerSelector ? document.querySelector(this.containerSelector) : null;

      this.observerOptions = {
        root: this.root,
        rootMargin: "0px",
        threshold: thresholds
      };

      this.intersectionObserver = new IntersectionObserver(this.handleIntersect, this.observerOptions);

    },

    createDomObserver(){


      // 问题：
      // 问题页面、首页都有内容，而回答页面在”更多“中的两个回答，初始状态是没有的，无法通过向上查找的方式找到containerElement

      let containerElement;
      if (this.urlType !== "answer") {
        // .List与实际的 .List-item之间隔了几层
        // let containerElement = document.querySelector(this.containerSelector);

        // 改变思路，变成找 .List-item的parent属性
        // querySelector 在没有匹配时返回 null，而querySelectorAll没有匹配时返回空的NodeList
        // let target = document.querySelector(this.targetSelector + "abc");
        // let target = document.querySelector(this.targetSelector);

        // let target = document.querySelector(this.targetSelector[this.type]);
        // let target = document.querySelector(this.targetSelector[this.actualTargetSelector]);
        let target = document.querySelector(this.actualTargetSelector);
        if (!target) return;

        // containerElement = target;
        containerElement = target.parentNode;
      } else {
        containerElement = document.querySelector(this.containerSelector[this.urlType]);
      }

      console.log('containerElement:', containerElement);
      let options = { childList: true, subtree: false, attributes: false };

      this.domObserver = new MutationObserver(this.handleDomMutation);
      this.domObserver.observe(containerElement, options);

    },

    observeInitial(){
      // let items = document.querySelectorAll(this.targetSelector[this.type]);
      let items = document.querySelectorAll(this.actualTargetSelector);
      console.log("initial observe:", items);
      this.observe(items);
    },
    observe(targets){
      let that = this;

      targets.forEach((item) => {
        that.intersectionObserver.observe(item);
      });
    },

    // handleDomMutation(mutationList, observer){
    handleDomMutation(mutationList){

      // console.log(observer);
      console.log("new list items: ");
      console.log(mutationList);
      // console.log(mutationList[0]);
      // console.log(mutationList[0].addedNodes);

      let addedNodes = [];

      if (this.urlType !== "answer") {
        mutationList.forEach((item) => {
          // addedNodes.concat(item.addedNodes);
          item.addedNodes.forEach((nodeItem) => {
            addedNodes.push(nodeItem);
          });
        });
      } else {
        // 回答页面”更多“中的两个回答也是动态插入的
        let element = mutationList[0].addedNodes[0];
        if (element.classList.contains(this.moreAnswerCssClass)) {
          addedNodes = element.querySelectorAll(this.moreAnswerSelector);
        }

      }

      console.log("新增 intersection 监控：" + addedNodes.length + "个");

      this.observe(addedNodes);

      // 目前不需要解除监控，因为正常情况不会删除页面上的node，除非在调试模式手动删除
      // 被删除的节点在 removedNodes属性中，类型也是NodeList，无被删除的则为空NodeList
    },

    // handleIntersect(entries, observer){
    handleIntersect(entries){

      // entries 对于某个被监控的元素只有一个记录
      // 有多个记录是因为多个元素的 threshold 被触发了

      console.log("intersection:", entries);
      // console.log(observer);

      let that = this;
      let minRatio = this.minRatio;

      // 收集：链接类型、链接、作者、当前时间
      entries.forEach((item) => {
        // console.log(item);
        if (item.isIntersecting && item.intersectionRatio >= minRatio) {
          // that.addHistory(item.target);
          // that.addRecent(item.target);
          that.addTarget(item.target);
        }
      });
    },

    // addHistory(target){
    // addRecent(target){
    addTarget(target){
      // console.log(target);

      let infoElement = target.querySelector(this.infoSelector);
      if (!infoElement) return;

      let info = infoElement.dataset.zop;
      // console.log(infoElement);
      // console.log(info);

      if (!info) return;
      info = JSON.parse(info);
      // console.log(info);

      // 有answerId不需要questionId也可以访问
      // let baseUrl = document.location.href;
      // let questionId = baseUrl.split("/")[-1];
      // let questionId = baseUrl.split("/").pop();

      let type = info.type.toLowerCase();

      let result = {
        type: type,
        itemId: info.itemId,
        title: info.title,
        author: info.authorName,
        // questionId: questionId,
        time: new Date()
      };

      // result.questionId = questionId;

      // console.log(result);

      // this.$store.commit("addHistory", result);
      // this.$store.dispatch("addHistory", result);
      this.addRecent(result);


    },
    getThreshold(){
      let thresholds = [];

      thresholds.push(0);

      for (let i = 1.0; i <= this.thresholdNum; i++) {
        let ratio = i / this.thresholdNum;
        thresholds.push(ratio);
      }
      return thresholds;
    },

    setReleaseTime(){
    },
    getTime() {
      let timeElement = document.querySelector(".ContentItem-time");
      let time = timeElement.innerHTML;
      console.log(timeElement);
      return time;
    }
  },

  mounted() {

    this.setReleaseTime();

    this.createObserver();

    this.loadRecent();

    this.timer = setInterval(this.flushCache, this.timerInterval);

  },
  beforeDestroy(){
    clearInterval(this.timer);
    this.timer = null;
  }
};
</script>

<style lang="scss" scoped>

.greet {
  color: dodgerblue;
}

.show-button-container {
  position: fixed;
  top: 100px;
  right: 350px;
}

.clear-button-container {
  /*position: absolute;*/
  position: fixed;
  top: 150px;
  right: 350px;
}

.show-button-container .show, .clear-button-container .clear{
  display:inline-block;
  margin-right: 1em;
}

</style>
