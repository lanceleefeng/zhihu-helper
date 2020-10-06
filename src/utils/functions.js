
// 15 - vue 自定义全局函数 - 简书
// https://www.jianshu.com/p/1f1c6e8594a1

export default {
  // install (Vue, options) {
  install(Vue) {
    Vue.prototype.$getDialogItems = function(
      data,
      valueKey,
      labelKey,
      separator
    ) {
      let result = [];
      // data.forEach((item, index) => {
      data.forEach(item => {
        let label = "";
        // console.log(typeof labelKey)
        // console.log(labelKey)

        // typeof 没有array/Array，数组的typeof是object
        // valid-typeof - Rules - ESLint - Pluggable JavaScript linter
        // https://eslint.org/docs/rules/valid-typeof

        // if ((typeof labelKey) === "Array") {
        // if ((typeof labelKey) !== "string") {

        if (typeof labelKey === "object") {
          let arrLabel = [];
          labelKey.forEach(key => {
            arrLabel.push(item[key]);
          });
          label = arrLabel.join(separator);
        } else {
          label = item[labelKey];
        }
        let resultItem = { label: label, value: item[valueKey] };
        result.push(resultItem);
      });
      console.log(result);
      return result;
    };

    Vue.prototype.$getUrlType = function() {
      let type;

      console.log(document.location.href);
      let url = document.location.href;

      let indexUrl = "https://www.zhihu.com/";
      let articleUrlPattern = /^https:\/\/zhuanlan\.zhihu\.com\/p\/\d+/i;

      if (url.indexOf(indexUrl) === 0) {

        url = url.replace(indexUrl, "");

        let urlParts = url.split("/");
        let part1 = urlParts[0];

        let sameAsPart1 = ["follow", "hot", "room", "zvideo", "answer"];

        if (part1 === "") {
          type = "recommend";
        } else if (sameAsPart1.includes(part1)) {
          type = part1;
        } else if (part1 === "question") {
          if (2 in urlParts) {
            let sub = urlParts[2];

            if (sub === "answer") {
              type = "answer";
            } else if (sub === "p") {
              // 不能匹配到 article，article 域名是 zhuanlan.zhihu.com
              type = "article";
            }
          } else {
            type = "question";
          }
        }
      } else if (articleUrlPattern.test(url)) {
        type = "article";
      }

      console.log("url type:", type);
      return type;
    };
  }
};

