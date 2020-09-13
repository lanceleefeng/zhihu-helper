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

      containerSelector: '.List',
      // containerSelector: null,
      root: null,
      targetSelector: '.List-item',
      // thresholdNum: 20,
      thresholdNum: 100,
      observerOptions: {}

    };
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

    handleIntersect(entries, observer){

      console.log(entries);
      console.log(observer);

    },
    handleDomMutation(mutationList, observer){
      console.log('new list items: ');
      console.log(mutationList);
      console.log(observer);
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

  computed: {

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
