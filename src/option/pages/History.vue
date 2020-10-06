<template>
  <div>
    <h2>浏览记录</h2>

    <div v-for="item in items" :key="item.type + item.itemId + item.time.toJSON()">
      <a :href="getUrl(item)" target="_blank">{{ item.type }}：{{ item.title }} - {{ item.author }}</a>
    </div>
    <button type="button" @click="prevPage">上一页</button>
    <button type="button" @click="nextPage">下一页</button>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "History",
  components: {},

  data() {
    return {
      urlPattern: {
        answer: "https://www.zhihu.com/answer/",
        question: "https://www.zhihu.com/question/",
        article: "https://zhuanlan.zhihu.com/p/",
        zvideo: "https://www.zhihu.com/zvideo/"
      },
      page: 1,
      items: []
    };
  },

  computed: {
    ...mapGetters({
      paginator: "paginator"
    })
  },

  methods: {
    ...mapActions({
      loadAll: "loadAll",
      loadRecent: "loadRecent",
      loadHistory: "loadHistory"
    }),
    getUrl(item) {
      let url;
      // if (item.type === "answer") {
      //   url = this.urlPattern[item.type] + item.itemId;
      // }
      url = this.urlPattern[item.type] + item.itemId;
      return url;
    },
    loadPage(n) {
      this.items = this.paginator(n);
    },
    prevPage() {
      this.page = this.page >= 2 ? this.page - 1 : 1;
      this.items = this.$store.getters.paginator(this.page);
    },
    nextPage() {
      this.page++;
      // this.items = this.paginator(this.page);
      this.items = this.$store.getters.paginator(this.page);
    }
  },

  mounted() {
    // this.loadRecent();
    // this.loadHistory();
    this.loadAll().then(() => {
      this.loadPage(this.page);
    });
    // this.loadPage(this.page);
  }
};
</script>
