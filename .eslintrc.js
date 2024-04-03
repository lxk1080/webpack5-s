module.exports = {
  // 继承官方 eslint 规则
  extends: ["eslint:recommended"],
  // 解决 webpack import 语法报错问题，需要安装 eslint-plugin-import 插件库（但这里不知道为啥不生效，配置下面的 ecmaVersion: 11 也可解决问题）
  plugins: ["import"],
  env: {
    node: true, // 启用 node 中全局变量，例如：console
    browser: true, // 启用浏览器中全局变量，例如：document
  },
  parserOptions: {
    ecmaVersion: 11, // es11，让 eslint 识别 es6+ 直到 es11 的代码
    sourceType: "module", // es module，让代码中可以使用 import 和 export
  },
  rules: {
    "no-var": 2, // 不能使用 var 定义变量
  },
};
