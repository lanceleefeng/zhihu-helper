<template>
  <div>
    <h2>浏览记录</h2>
    hello
    <h3>浏览记录2</h3>

    <div v-for="item in items" :key="item.type + item.itemId + item.time.toJSON()">
      {{ item.title }} - {{ item.author }}
    </div>
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
      loadRecent: "loadRecent",
      loadHistory: "loadHistory"
    }),
    loadPage(n) {
      this.items = this.paginator(n);
    },
    nextPage() {
      this.page++;
      // this.items = this.paginator(this.page);
      this.items = this.$store.getters.paginator(this.page);
    }
  },

  mounted() {
    this.loadRecent();
    this.loadHistory();
    this.loadPage(1);
  }
};
</script>
