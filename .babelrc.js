module.exports = {
  // presets：就是一组 Babel 插件的集合
  // @babel/preset-env：一个智能预设，允许您使用最新的 JavaScript
  // @babel/preset-react：一个用来编译 React jsx 语法的预设
  // @babel/preset-typescript：一个用来编译 TypeScript 语法的预设
  presets: ['@babel/preset-env'],
  // 使用最新的 es6... 语法，还需要别的 polyfill，可以逐个加在 plugins 里
  plugins: [],
}
