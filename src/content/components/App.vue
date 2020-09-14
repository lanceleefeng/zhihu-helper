<template>
  <div class="greet">
    hello
  </div>
</template>

<script>
export default {
  name: "App",

  components: {},

  data() {
    return {

      intersectionObserver: null,
      domObserver: null,

      // 超过 minRatio 的就记录为浏览过的
      // minRatio: 0.01,
      minRatio: 0.03,

      containerSelector: '.List',
      // containerSelector: null,
      root: null,
      targetSelector: '.List-item',
      infoSelector: '.ContentItem',
      // thresholdNum: 20,
      thresholdNum: 100,
      observerOptions: {}

    };
  },

  computed: {

  },

  methods: {

    // 首页上回答、问题、文章需要用定时器不断检查

    // 也有监控 DOM 树是否变化的接口，可以代替定时检查

    createObserver(){

      this.createIntersectionObserver();
      this.createDomObserver();

      this.observeInitial();

    },
    createIntersectionObserver(){

      // let intersectionObserver;
      let thresholds = this.getThreshold();

      // 不应该使用包含 .List-item 的 .List：
      // 回答与回答列表的 Intersection 并不会变化，而是与当前可视窗口 viewport 的 Intersection 会变化
      // 因此 root 要用 null

      // let rootElement = this.containerSelector ? document.querySelector(this.containerSelector) : null;

      this.observerOptions = {
        root: this.root,
        rootMargin: '0px',
        threshold: thresholds
      };

      this.intersectionObserver = new IntersectionObserver(this.handleIntersect, this.observerOptions);

    },

    createDomObserver(){

      // .List与实际的 .List-item之间隔了几层
      // let containerElement = document.querySelector(this.containerSelector);

      // 改变思路，变成找 .List-item的parent属性
      // querySelector 在没有匹配时返回 null，而querySelectorAll没有匹配时返回空的NodeList
      // let target = document.querySelector(this.targetSelector + 'abc');
      let target = document.querySelector(this.targetSelector);
      if (!target) return;

      // let containerElement = target;
      let containerElement = target.parentNode;

      let options = {subtree: false, childList: true, attributes: false};
      this.domObserver = new MutationObserver(this.handleDomMutation);
      this.domObserver.observe(containerElement, options);
    },

    observeInitial(){
      let items = document.querySelectorAll(this.targetSelector);
      console.log(items);
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
      console.log('new list items: ');
      console.log(mutationList);
      console.log(mutationList[0]);
      console.log(mutationList[0].addedNodes);

      let addedNodes = [];
      mutationList.forEach((item) => {
        // addedNodes.concat(item.addedNodes);
        item.addedNodes.forEach((nodeItem) => {
          addedNodes.push(nodeItem);
        });
      });
      console.log('新增 intersection 监控：' + addedNodes.length + '个');
      this.observe(addedNodes);

      // 目前不需要解除监控，因为正常情况不会删除页面上的node，除非在调试模式手动删除
      // 被删除的节点在 removedNodes属性中，类型也是NodeList，无被删除的则为空NodeList
    },

    handleIntersect(entries, observer){

      // entries 对于某个被监控的元素只有一个记录
      // 有多个记录是因为多个元素的 threshold 被触发了

      console.log(entries);
      console.log(observer);

      let that = this;
      let minRatio = this.minRatio;


      // 收集：链接类型、链接、作者、当前时间
      entries.forEach((item) => {
        console.log(item);
        if (item.isIntersecting && item.intersectionRatio >= minRatio) {
          that.addHistory(item.target);
        }
      });
    },
    addHistory(target){
      console.log(target);
      let infoElement = target.querySelector(this.infoSelector);
      if (!infoElement) return;

      let info = infoElement.dataset.zop;
      console.log(infoElement);
      console.log(info);

      if (!info) return;
      info = JSON.parse(info);
      console.log(info);

      // 有answerId不需要questionId也可以访问
      // let baseUrl = document.location.href;
      // let questionId = baseUrl.split('/')[-1];
      // let questionId = baseUrl.split('/').pop();

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

      console.log(result);

      // 一级缓存：如何判断当前正在看的

      // 最近半个小时内的，保存最后触发时间；
      // 超过了半个小时的，在更新时保存到长期记录中；
      // 最后一批半小时看的，在下次继续浏览知乎网站时，全部保存到长期记录；

      // 半个小时内，同一个文章、回答只保存一条，超过半个小时，同一天可以有多个记录

      this.$store.commit('addHistory', result);


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
      let timeElement = document.querySelector('.ContentItem-time');
      let time = timeElement.innerHTML;
      console.log(timeElement);
      return time;
    }
  },

  mounted() {
    this.setReleaseTime();

    this.createObserver();

  }
};
</script>

<style lang="scss" scoped>
.greet {
  color: dodgerblue;
}
</style>
