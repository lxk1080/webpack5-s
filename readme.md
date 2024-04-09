## 说明

1. `npm run docs`，打开说明文档

2. `npm run dev`，webpack5 开发环境运行

3. `npm run build`，webpack5 生产环境打包

4. `npm run dev:react`，react-cli 开发环境运行

5. `npm run build:react`，react-cli 生产环境打包

6. `npm run dev:vue`，vue-cli 开发环境运行

7. `npm run build:vue`，vue-cli 生产环境打包

8. 优化打包构建的几个角度
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
         - 这个插件还有个功能：防止 babel-polyfill（core-js）注入造成全局污染。插件会自定义 polyfill 方法名，并在编译时使用
           - 此功能一般用于第三方库的开发，要使用此功能需要：
             - 安装 @babel/runtime-corejs3 作为生产依赖（注意：@babel/runtime、@babel/runtime-corejs2、@babel/runtime-corejs3 三者只能用其一）
             - 对 @babel/plugin-transform-runtime 插件做自定义配置：`{ corejs: 3 }`，具体使用可参考生产配置
         - 更多使用方法，可以参考 babel 的官方文档：https://babeljs.io/docs/babel-plugin-transform-runtime
       - 开发模式和生产模式都可以用，需要时优化
     - image-minimizer
       - 压缩图片，一般情况下不需要，现在图片一般不会放在本地，都是 CDN 链接，如果本地的静态图片比较多，可以考虑使用（本项目中没有提供示例，需要的话看文档）
         - 一般来讲公司都有 CMS（内容管理系统），图片 path 不变，在不同的环境匹配不同的域名即可
       - 主要使用插件：image-minimizer-webpack-plugin，通过安装不同的其他包，区分为两种模式：无损压缩和有损压缩（相关的包可能很难下载下来。。）
   - 优化代码运行性能
     - Code Split
       - why：打包代码时会将所有 js 文件打包到一个文件中，体积太大了
       - what：将打包生成的文件进行代码分割，生成多个 js 文件，并且按需加载
         - 实现上分成两个小部分，一个是 `import()` 动态引入的语法，另一个是对 `optimization.splitChunks` 的配置
         - 在 import 语法中有用到魔法注释，关于魔法注释，可以参考文档：https://webpack.docschina.org/api/module-methods/#magic-comments
       - 开发模式和生产模式都可以用，尤其是要用到生产模式，优化代码产出
     - Preload / Prefetch
       - why：做了代码分割，使用 import 动态导入语法来进行代码按需加载，但是加载速度还不够好，比如：用户点击按钮时才加载这个资源，如果资源体积很大，那么用户会感觉到明显卡顿效果，我们想在浏览器空闲时间，加载后续需要使用的资源。我们就需要用上 Preload 或 Prefetch 技术
       - what：
         - 两种方式
           - `Preload`：预加载，告诉浏览器立即加载资源
           - `Prefetch`：预获取，告诉浏览器在空闲时才开始加载资源
         - 共同点
           - 都只会加载资源，并不执行
           - 都有缓存
         - 不同点
           - Preload 加载优先级高，Prefetch 加载优先级低
           - Preload 只能加载当前页面需要使用的资源，Prefetch 可以加载当前页面资源，也可以加载下一个页面需要使用的资源
         - 总结
           - 当前页面优先级高的资源用 Preload 加载
           - 将来的页面需要使用的资源用 Prefetch 加载
         - 它们的兼容性较差，Preload 相对于 Prefetch 兼容性好一点，但现在应该也没多少人用上古浏览器了吧！
         - 使用后的效果是：可以让 webpack 输出 Resource Hint
           - 例如：动态加载文件 `import('./path/to/LoginModal.js')`，代码在构建时会生成 `<link rel="prefetch" href="login-modal-chunk.js">` 并追加到页面头部，指示浏览器在闲置时间预获取 login-modal-chunk.js 文件
         - 本示例用的是 @vue/preload-webpack-plugin 插件，其实 webpack5 已经内置了此功能（但似乎不能全局配置）
           - 注意：使用本插件会在打包的时候直接插入 link 标签到 html 模板中，但是内置方法不会直接插，而是在代码运行的时候通过 js 控制插入
           - 可参考官方文档：https://webpack.docschina.org/guides/code-splitting/#prefetchingpreloading-modules
       - 开发模式和生产模式都可以用，主要是生产模式，可以提高页面响应速度
     - Network Cache
       - why：配合 hash 值的变化做浏览器缓存，优化页面加载速度，确保文件内容改变时，hash 值变化，文件内容未变时，hash 值不变
       - what：
         - 三种生成 hash 值的方式
           - fullhash（webpack4 是 hash，在 webpack5 中 hash 已弃用）
             - 每次修改任何一个文件，所有文件名的 hash 值都将改变。所以一旦修改了任何一个文件，整个项目的文件缓存都将失效
             - 注意这个 fullhash 只能用于 “编译层面” 的替换，不能用于输出的媒体文件名替换
             - 输出的媒体文件，例如图片、视频、字体等 bundle 文件中，文件名可以使用模块层面的 hash 做替换
               - 其实也可以使用 contenthash 做替换，但考虑到一般来说，媒体文件的内容是不会被修改的，不用考虑缓存问题，所以直接使用 hash 即可
             - 具体使用可以参考官方文档：https://webpack.docschina.org/configuration/output/#template-strings
           - chunkhash
             - 根据不同的入口文件(Entry)进行依赖文件解析、构建对应的 chunk，生成对应的哈希值。我们 js 和 css 是同一个引入，会共享一个 hash 值
           - contenthash
             - 根据文件内容生成 hash 值，只有文件内容变化了，hash 值才会变化。所有文件的 hash 值是独享且不同的
             - 适用于经常修改的文件
         - 对于我们经常修改的文件，使用 contenthash 可以保证文件在未修改时，其 hash 值不变，但是仍然存在问题：
           - 假如在我们生成的 bundle 文件中，A 文件依赖于 B 文件，B 文件对应的 module 做修改时，重新打包生成的 B 文件 hash 值会变化，这个正常，但是 A 文件的 hash 值也会变化，这是因为 A 文件依赖于 B 文件，B 文件的文件名发生了变化，所以在 A 文件中的 B 文件的引用也发生了变化，这就间接的导致了 A 文件的 hash 值也发生了变化，但是我们不希望 A 文件的 hash 发生变化，怎么办？
           - 解决方法就是：将 hash 值单独保管在一个 runtime 文件中
           - 我们最终输出三个文件：A、B、runtime。当 B 文件发生变化，变化的是 B 和 runtime 文件，A 不变
           - runtime 文件只保存文件的 hash 值和它们与文件的关系，整个文件体积就比较小，所以变化重新请求的代价也小，并且不影响页面
           - 只需要对 `optimization.runtimeChunk` 进行配置即可
       - 主要是生产模式使用，开发模式感觉用了也没啥用，开发环境主要使用热更新
     - Core-js
       - why：这个其实不是什么优化性能，而是必须要做的事。我们使用 babel 对 ES6 代码进行处理，它能将 ES6 语法进行编译转换，比如箭头函数、点点点运算符等。但是如果是 async 函数、promise 对象、数组的一些方法（includes）等，它没办法处理。也就是说 babel 只能处理 ES6 的新语法，而不能处理新的 API。所以此时我们编译后的 js 代码仍然存在兼容性问题，一旦遇到低版本浏览器就会直接报错
       - what：core-js 是专门用来做 ES6 以及以上 API 的 polyfill（补丁）
         - 配置自动按需引入，参见：`.babelrc.js` 文件
         - 要注意 package.json 文件中 browserslist 的配置，否则可能无法引入 polyfill 代码
     - PWA
       - why：开发 Web App 项目，项目一旦处于网络离线情况，就没法访问了，如果想给项目提供离线体验的话，就可用上 PWA
       - what：渐进式网络应用程序（progressive web application - PWA）：是一种可以提供类似于 native app（原生应用程序）体验的 Web App 的技术，最重要的是，在离线（offline）时应用程序能够继续运行离线功能（不可能完整的，没网你还想咋样！），内部通过 Service Worker 技术实现
       - how：参考官方文档：https://webpack.docschina.org/guides/progressive-web-application/
         - 添加 Workbox 插件（workbox-webpack-plugin）
         - 在入口文件注册 Service Worker
       - 用于生产模式，在断网时供用户使用离线功能

9. 构建流行框架的脚手架（非命令式）
    - React-Cli
      - 所在目录：react-cli
      - webpack 配置基本沿用之前的常规配置，相对来说，有以下改动：
        - 公共改动：
          - 引入 cross-env 设置环境变量
          - 使用 babel-loader 处理 jsx? 文件，使用预设：babel-preset-react-app
          - eslint 配置，使用 extends：eslint-config-react-app
          - 使用 resolve.extensions 自动补全
          - 去掉了多进程功能，需要时再加
          - 使用路由懒加载：React.lazy、React.Suspense
        - 开发模式改动：
          - 激活 js 热更新（HMR），需要插件：@pmmmwh/react-refresh-webpack-plugin
          - devServer 兜底 index.html 配置：historyApiFallback: true
        - 生产模式改动：
          - 引入 copy-webpack-plugin，复制静态资源
          - 使用 splitChunks 分割代码（antd、react、其它）
    - Vue-Cli
      - 所在目录：vue-cli
      - webpack 配置和 react-cli 的差不多，相对来说，有以下改动：
        - 公共改动：
          - 自动补全把 .jsx 换成 .vue，并去掉处理 .jsx 结尾文件的配置
          - 增加 vue-loader 和 VueLoaderPlugin 插件
          - 将 style-loader 替换为 vue-style-loader
          - babel-loader 使用预设：@vue/cli-plugin-babel/preset（这个是安装 @vue/cli-plugin-babel 包）
          - eslint 使用 vue 官方配置："plugin:vue/vue3-essential" 和 "eslint:recommended"
          - 删除 loader 匹配的 oneOf 功能，因为 vue-loader 不支持
          - 使用 DefinePlugin 增加几个环境变量，解决 vue 页面提示警告的问题
          - Element Plus 按需加载配置：unplugin-auto-import、unplugin-vue-components
          - 配置了路径别名：resolve.alias
        - 开发模式改动：
          - 删除 react 的 js 热更新（HMR）功能，vue-loader 自带 HMR 功能
        - 生产模式改动：
          - 使用 splitChunks 分割代码（element-plus、vue、其它）
      - 关于 vue-loader 的使用，参考官方文档：https://vue-loader.vuejs.org/


