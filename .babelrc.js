module.exports = {
  // presets：就是一组 Babel 插件的集合
  // @babel/preset-env：一个智能预设，允许您使用最新的 JavaScript
  // @babel/preset-react：一个用来编译 React jsx 语法的预设
  // @babel/preset-typescript：一个用来编译 TypeScript 语法的预设
  presets: [
    // 配置 core-js 自动按需引入 polyfill 代码（需要先安装 core-js 库）
    // 注意：babel 会根据你 package.json 文件中的 browserslist 判断是否需要做 API 兼容
    //  - 如果你的 browserslist 都是一些最新的浏览器版本，这些浏览器已经实现了这些 API，那么，将不会引入 polyfill 代码
    //  - 如果你一定需要引入 polyfill 代码，可以在 browserslist 中添加一些上古浏览器，例如："IE 10"
    ['@babel/preset-env', {
      useBuiltIns: 'usage',
      corejs: 3,
    }]
  ],
  // 使用最新的 es6... 语法，还需要别的 polyfill，可以逐个加在 plugins 里
  plugins: [],
}
