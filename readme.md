## 说明

1. `npm run docs`，打开说明文档

2. `npm run dev`，开发环境运行

3. `npm run build`，生产环境打包

4. 优化打包构建的几个角度
   - 提升开发体验
     - SourceMap（源代码映射）
       - 增强调试体验。生成打包后代码和源代码之间的行列映射
       - 开发模式用，生产模式可以用但一般不需要
   - 提升打包构建速度
     - HotModuleReplacement（HMR/热模块替换）
       - 在程序运行中，替换、添加或删除模块，而无需重新加载整个页面
       - 开发模式用
     - oneOf
       - why：打包时每个文件都会经过所有 loader 处理，虽然因为 test 正则实际没有处理上，但是都要过一遍。比较慢
       - what：只能匹配上一个 loader，剩下的就不匹配了
       - 开发模式和生产模式都可以用，需要时优化，否则可能会更慢
     - include/exclude
       - why：开发的代码中可能引用第三方库，是不需要使用 loader 处理的
       - 一般只用做 js 的配置，css 不需要，因为 css 一般不引用第三方库
       - 开发模式和生产模式都要用，基础配置
     - cache
       - why：每次打包时 js 文件都要经过 Eslint 检查 和 Babel 编译，速度比较慢
       - what：对 Eslint 检查 和 Babel 编译结果进行缓存，这样再次打包时只用打包修改过的部分，速度就会更快了
       - 开发模式和生产模式都可以用
     - thread
       - why：当项目越来越庞大时，打包速度越来越慢，想要继续提升打包速度，其实就是要提升 js 的打包速度，因为其他文件都比较少
         - 对 js 文件处理主要就是 eslint 、babel、Terser 三个工具，所以我们要提升它们的运行速度，可以开启多进程同时处理 js 文件
       - what：多进程打包：开启电脑的多个进程同时干一件事，速度更快
         - 需要注意：仅在特别耗时的操作中使用，因为每个进程启动就有大约为 600ms 左右开销
       - 开发模式和生产模式都可以用，不过开发模式不需要压缩代码（Terser）
   - 减少代码体积
     - Tree Shaking
       - 移除 JavaScript 中的没有使用上的代码，注意只适用于 es module 的静态引入
       - 生产模式自动启用，可以配合属性：sideEffects
     - @babel/plugin-transform-runtime
       - why：Babel 为编译的每个文件都插入了辅助代码，比如 _extend，使代码体积过大，可以将这些辅助代码作为一个独立模块，来避免重复引入
       - what：禁用了 Babel 自动对每个文件的 runtime 注入，而是引入 @babel/plugin-transform-runtime 并且使所有辅助代码从这里引用
         - 事实上，这个插件的功能是：防止 babel-polyfill 注入造成全局污染，而自定义 polyfill 方法名，并在编译时使用
         - 此插件一般用于第三方库的开发，不过这个功能也确实是防止了注入，间接的优化了代码
       - 开发模式和生产模式都可以用，需要时优化
     - image-minimizer
       - 压缩图片，一般情况下不需要，现在图片一般不会放在本地，都是 CDN 链接，如果本地的静态图片比较多，可以考虑使用
       - 主要使用插件：image-minimizer-webpack-plugin，通过安装不同的其他包，区分为两种模式：无损压缩和有损压缩
   - 优化代码运行性能


