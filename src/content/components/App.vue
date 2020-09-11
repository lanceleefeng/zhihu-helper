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
    return {};
  },
  methods: {

    // 首页上回答、问题、文章需要用定时器不断检查

    setReleaseTime () {
      let time = this.getTime();
      console.log(time);

      let containerClass;

      // containerClass = '.Post-Author';
      // containerClass= '.AuthorInfo';
      containerClass = '.Voters';

      let container = document.querySelector(containerClass);
      console.log(container);

      // let target = document.createElement('span');
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
    getTime () {
      let timeElement = document.querySelector('.ContentItem-time');
      let time = timeElement.innerHTML;
      console.log(timeElement);
      return time;
    }
  },

  computed: {},

  mounted() {
    this.setReleaseTime()
  }
};
</script>

<style lang="scss" scoped>
.greet {
  color: dodgerblue;
}
</style>
