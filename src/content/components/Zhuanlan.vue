<template>
  <div class="greet">
    <!--<h2>hello</h2>-->
    <span ref="time" class="time-in-header">{{ time }}</span>
  </div>
</template>

<script>
import { mapMutations, mapActions } from "vuex";

export default {
  name: "Zhuanlan",

  components: {},

  data() {
    return {
      urlType: null,
      time: null,
      selector: {
        historyTarget: ".Post-content",
        target: {
          article: ".Post-content",
          zvideo: ".ZVideo-video"
        },
        timeContainer: ".Voters",
        timeSelector: ".ContentItem-time"
      }
    };
  },

  methods: {
    ...mapMutations({
      addRecent: "addRecent"
    }),
    ...mapActions({
      flush: "flush"
    }),
    addHistory() {

      // let selector = this.selector.historyTarget;
      let selector = this.selector.target[this.urlType];

      if (!selector) return;

      let target = document.querySelector(selector);

      if (!target) return;

      this.addTarget(target);
      this.flush();
    },

    // addHistory(target){
    // addRecent(target){
    addTarget(target) {
      // console.log(target);

      // let infoElement = target.querySelector(this.infoSelector);
      // if (!infoElement) return;

      // let infoElement = target;

      // let info = infoElement.dataset.zop;
      let info = target.dataset.zop;
      // console.log(infoElement);
      // console.log(info);

      if (!info) return;
      info = JSON.parse(info);

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

    setReleaseTimeInHeader() {
      // let containerClass;

      // containerClass = ".Post-Author";
      // containerClass= ".AuthorInfo";
      // containerClass = ".Voters";
      // containerClass = this.selector.timeContainer;

      let selector = this.selector.timeContainer;
      let container = document.querySelector(selector);
      console.log(container);

      if (!container) return;

      let time = this.getTime();
      console.log(time);

      // let target = document.createElement("span");
      let target = this.$refs.time;
      container.appendChild(target);

      console.log(target);

      // 区别：
      // 覆盖 innerHTML 属性，是用脚本手动修改内容；
      // 而使用 time 属性，则是使用了 vue 提供的双向绑定

      // 发布于 08-02

      // target.innerHTML = time;
      this.time = time;
    },
    getTime() {

      let selector = this.selector.timeSelector;
      let timeElement = document.querySelector(selector);
      let time = timeElement.innerHTML;
      console.log(timeElement);
      return time;
    }
  },

  computed: {},

  mounted() {
    this.urlType = this.$getUrlType();

    if (this.urlType === "article") {
      this.setReleaseTimeInHeader();
      this.addHistory();
    } else if (this.urlType === "zvideo") {
      this.addHistory();
    }
  }
};
</script>

<style lang="scss" scoped>
.greet {
  color: coral;
}
.time-in-header {
  /*color: dimgray;*/
  float: right;
}
</style>
