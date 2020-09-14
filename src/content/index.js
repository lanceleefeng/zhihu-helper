import Vue from "vue";
import App from "./components/App.vue";
import insert from "@/utils/insert";
import stroe from "@/mixins/store";

// 注入js到页面
injectJS();

Vue.mixin(stroe);

// 插入组件到页面中
insert(App);

function injectJS() {
  document.addEventListener("readystatechange", () => {
    const injectPath = "inject.js";
    const temp = document.createElement("script");
    console.log(injectPath);

    temp.setAttribute("type", "text/javascript");
    // 获得的地址类似：chrome-extension://ihcokhadfjfchaeagdoclpnjdiokfakg/js/inject.js
    // temp.src = chrome.extension.getURL(injectPath);
    // document.body.appendChild(temp);
  });
}

console.log('in content/index.js');


// 去掉标题中的消息数提示

// document.title = '(3 条消息)为何中国不学当年日本那样主动刺破房地产泡沫？ - 知乎  ';

let config = {
  pattern: /\(\d+\+?\s*条消息\)/,
  interval: 1000
};

// var patternReg = new RegExp(config.pattern);
let patternReg = config.pattern;

function delMessageNum()
{

  if(patternReg.test(document.title)){
    console.log('Original title: ' + document.title);
    document.title = document.title.replace(patternReg, '');
    console.log('New title: ' + document.title);
  }

}


delMessageNum();
window.setInterval(delMessageNum, config.interval);


