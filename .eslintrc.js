module.exports = {
  // 继承官方 eslint 规则
  extends: ["eslint:recommended"],
  // 解决 webpack import 语法报错问题，需要安装 eslint-plugin-import 插件库
  // 需要同时安装 @babel/eslint-parser，并在下面配置为解析器：parser: "@babel/eslint-parser"（即使不为解决问题，也建议使用这个解析器）
  // 另外：
  // 配置下面的 ecmaVersion: 11 也能解决问题，但这个是利用 es11 的 import 特性，并不是真的 webpack 提供的 import() 语法（但其实在使用上也没差，而且这个更方便）
  // 这里是为了演示，所以使用的是 eslint-plugin-import 插件，实际工作中，推荐 ecmaVersion: 11 这种方式解决
  plugins: ["import"],
  env: {
    node: true, // 启用 node 中全局变量，例如：console
    browser: true, // 启用浏览器中全局变量，例如：document
    es6: true, // 启用 es6 中全局变量，例如：Promise
  },
  parser: "@babel/eslint-parser", // 支持最新的 ECMAScript 标准
  parserOptions: {
    ecmaVersion: 6, // es6，让 eslint 识别 es6 的代码
    sourceType: "module", // es module，让代码中可以使用 import 和 export
  },
  rules: {
    "no-var": 2, // 不能使用 var 定义变量
  },
  globals: {
    APP_ENV: "readonly",
  },
};
