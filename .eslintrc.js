module.exports = {
  // 继承官方 eslint 规则
  extends: ["eslint:recommended"],
  env: {
    node: true, // 启用 node 中全局变量，例如：console
    browser: true, // 启用浏览器中全局变量，例如：document
  },
  parserOptions: {
    ecmaVersion: 6, // es6，让 eslint 识别 es6 代码
    sourceType: "module", // es module，让代码中可以使用 import 和 export
  },
  rules: {
    "no-var": 2, // 不能使用 var 定义变量
  },
};
