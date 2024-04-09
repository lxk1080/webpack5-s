import { createApp } from "vue";
import App from "./App";
import router from "./router";

// 以下是 Element Plus 的全部引入，文件太大，我们需要按需引入，可以通过 webpack 进行配置
// import ElementPlus from "element-plus";
// import "element-plus/dist/index.css";

createApp(App)
  .use(router)
  // .use(ElementPlus)
  .mount(document.getElementById("app"));
