const os = require('os');
const path = require('path');
const webpack = require('webpack');
const ESLintWebpackPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const PreloadWebpackPlugin = require('@vue/preload-webpack-plugin'); // 虽然是 vue 下的一个插件，但可以不使用 vue，单独拿过来用
const WorkboxPlugin = require('workbox-webpack-plugin');

// cpu 核数，逻辑核数
const threads = os.cpus().length;
console.log('threads ==>', threads);

/**
 * @desc 处理样式公共方法
 * 1、使用 MiniCssExtractPlugin.loader 替换 style-loader，以通过 link 标签加载 css 样式
 * 2、引入 postcss-loader 来解决样式兼容性问题，写在 css-loader 之后，预处理器 loader 之前
 * 3、在 package.json 文件中添加 browserslist 来控制样式的兼容性做到什么程度
 *    - "browserslist": ["last 2 version", "> 1%", "not dead"]
 *    - 以上配置意义：支持浏览器最后两个版本、覆盖到 99% 的浏览器（冷门的算了）、有些发行就死了的浏览器不用支持
 *    - browserslist 是一个单独的库，但是它可供 postcss-preset-env 使用
 *    - 想了解更多 browserslist，去链接：https://github.com/browserslist/browserslist
 * @param preProcessor 预处理器
 * @returns {(string|*|string|{loader: string, options: {postcssOptions: {plugins: string[]}}})[]}
 */
const getStyleLoaders = (preProcessor) => {
  return [
    MiniCssExtractPlugin.loader,
    "css-loader",
    {
      loader: "postcss-loader",
      options: {
        postcssOptions: {
          plugins: [
            // 能解决大多数样式兼容性问题
            "postcss-preset-env",
          ],
        },
      },
    },
    preProcessor,
    // 如果没传 preProcessor，则 preProcessor 为 undefined，过滤掉
  ].filter(Boolean);
};

module.exports = {
  // 生产模式下，会自动开启 Tree Shaking 功能
  mode: 'production',
  // 生产模式一般不需要代码映射，如果需要，就用这个，包含行/列映射，但是打包编译速度慢
  devtool: 'source-map',
  // 关闭性能分析，能稍微提高一点点打包速度（关闭后就不会提示你类似什么xx模块太大的问题，没啥大用）
  performance: false,
  entry: {
    /**
     * 1、注意这个地方的相对路径
     *    - node 里面文件操作的相对路径，相对的不是这个文件，而是执行 node 命令所处的终端路径（所以这里最好使用 path.resolve 转化为绝对路径）
     *    - 但是 node 模块中的路径标识是相对于当前文件模块本身的（这里顺便一提，加深下印象）
     */
    main: './src/main.js',
  },
  output: {
    /**
     * 根目录，所有文件的输出目录
     */
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].[contenthash:8].js',
    /**
     * 设置通过代码分割功能得到的 chunk 输出的文件名，例如 import() 动态引入文件语法，
     * 如果不写这个字段，则默认遵循 filename 字段输出的格式，写了就会覆盖掉 filename 的格式
     */
    chunkFilename: 'js/[name].[contenthash:8].chunk.js',
    /**
     * 通过 type: asset 方式处理的资源文件统一命名（图片、视频、字体）
     *  - 此处是默认命名，如果下面有单独写 filename，就会覆盖掉这个默认的
     *  - 我的建议是单独命名，资源文件类型不一样，放到同一个目录下不好查找
     */
    assetModuleFilename: 'assets/[hash:8][ext][query]',
    /**
     * webpack5 清空目标文件夹不再需要引入插件
     */
    clean: true,
  },
  module: {
    rules: [
      {
        // oneOf 让文件被打包时只能匹配上一个 loader 处理，剩下的就不匹配了，提升打包速度
        oneOf: [
          /**
           * 1、webpack 只支持 es module（ import & export ），并不支持编译 es6 语法
           * 2、编译需要使用 babel-loader，配置写在了 .babelrc.js 文件
           * 3、开启 babel 缓存，再次打包时只打包修改过的部分，可以提升再次打包时的构建速度
           */
          {
            test: /\.js$/,
            exclude: /node_modules/, // 排除引入的 node_modules 中的文件
            use: [
              {
                loader: 'thread-loader', // 开启多进程
                options: {
                  workers: threads, // 进程数
                },
              },
              {
                loader: 'babel-loader',
                options: {
                  cacheDirectory: true, // 开启 babel 编译缓存，默认缓存路径为 node_modules/.cache
                  cacheCompression: false, // 缓存的文件不要压缩，压缩需要耗费时间
                  plugins: [
                    // 可以减少代码体积
                    // 如果配合以下注释代码使用，则可以使用沙盒环境 polyfill 功能（需要安装 @babel/runtime-corejs3 包作为生产依赖）
                    //  - 这个 polyfill，不会造成全局污染，一般用于开发第三方库（开发业务型项目还是使用 core-js）
                    ['@babel/plugin-transform-runtime', {
                      // absoluteRuntime: false,
                      // corejs: 3, // 主要是这个字段的配置，其它字段都是些默认值。此字段的默认值是 false，需要配合 @babel/runtime 包使用
                      // helpers: true,
                      // regenerator: true,
                    }]
                  ],
                },
              },
            ],
          },

          /**
           * css-loader：负责将 Css 文件编译成 Webpack 能识别的模块，让 Css 文件可以被引入
           * style-loader：会动态创建一个 Style 标签，里面放置 Webpack 中 Css 模块内容
           */
          {
            test: /\.css$/,
            use: getStyleLoaders(), // 从右到左执行
          },

          /**
           * less-loader：将 Less 文件编译成 Css 文件
           */
          {
            test: /\.less$/,
            use: getStyleLoaders('less-loader'),
          },

          /**
           * sass-loader：负责将 Sass 文件编译成 css 文件
           * sass：sass-loader 依赖 sass 进行编译
           */
          {
            test: /\.s[ac]ss$/,
            use: getStyleLoaders('sass-loader'),
          },

          /**
           * stylus-loader：将 Styl 文件编译成 Css 文件
           */
          {
            test: /\.styl$/,
            use: getStyleLoaders('stylus-loader'),
          },

          /**
           * 过去在 Webpack4 时，我们处理图片资源通过 file-loader 和 url-loader 进行处理
           * 现在 Webpack5 已经将两个 Loader 功能内置到 Webpack 里了，我们只需要简单配置即可处理图片资源
           * 关键字段：type: 'asset'
           */
          {
            test: /\.(png|jpe?g|gif|webp)$/,
            type: 'asset',
            parser: {
              dataUrlCondition: {
                /**
                 * 小于 10kb 的图片会被 base64 处理
                 * 优点：减少请求数量
                 * 缺点：体积变得更大，图片自身体积越大，变成 base64 后体积就更大，所以要限制被 base64 处理的图片大小
                 */
                maxSize: 10 * 1024,
              }
            },
            generator: {
              /**
               * 将图片文件输出到 imgs 目录中
               * [hash:8]: hash 值取前 8 位
               * [ext]: 使用之前的文件扩展名
               * [query]: 添加之前的 query 参数，注意这个参数不会加在输出的文件上，在请求文件的时候会自动加上
               * @example filename: "imgs/[hash:8].png",
               */
              filename: 'imgs/[hash:8][ext][query]',
            },
          },

          /**
           * asset/resource 发送一个单独的文件并导出 URL（启动服务下的绝对路径，例如：http://127.0.0.1/fonts/7269c5ce.ttf）。之前通过使用 file-loader 实现。
           * asset/inline 导出一个资源的 data URI。之前通过使用 url-loader 实现。
           * asset/source 导出资源的源代码。之前通过使用 raw-loader 实现。
           * asset 在导出一个 data URI 和发送一个单独的文件之间自动选择。之前通过使用 url-loader，并且配置资源体积限制实现。
           */
          {
            test: /\.(ttf|woff2?|mp3|mp4|avi)$/,
            // 直接移动文件到目标目录，在打包后的代码中通过绝对路径引入文件
            type: 'asset/resource',
            // 可以编程，对不同的文件类型设置不同的目标目录
            // generator: {
            //   filename: "fonts/[hash:8][ext]",
            // },
            generator: {
              filename: (content) => {
                if (
                  content.filename.includes('.ttf') ||
                  content.filename.includes('.woff')
                ) {
                  return 'fonts/[hash:8][ext]'
                }
                return 'media/[hash:8][ext]'
              }
            },
          },
        ],
      }
    ],
  },
  plugins: [
    /**
     * eslint 在 webpack4 的时候需要通过 loader 启用，在 webpack5 通过插件启用
     */
    new ESLintWebpackPlugin({
      // 指定要检查文件的根路径，lint 不通过，则编译不通过
      // 一般情况下，不会在编译的时候执行 lint，而是将 lint 提出来作为单独的一个命令，这里是演示
      context: path.resolve(__dirname, 'src'),
      // 指定需要排除检查的文件夹或文件，必须是根路径的相对路径
      // node_modules 是默认被排除的
      // 路径 ./ 代表的就是 src 文件夹内部
      exclude: ['node_modules', './eslint-test'],
      // 开启缓存，再次打包只用检查修改过的部分，提升构建速度
      cache: true,
      // 缓存目录，绝对路径，设置缓存文件的位置和 babel 缓存一起
      cacheLocation: path.resolve(__dirname, './node_modules/.cache/.eslintcache'),
      // 开启多进程并设置进程数（注意：开启多进程后，eslint 可能会忽略掉一些错误，打包畅然无阻）
      // threads,
    }),

    /**
     * 1、打包后的 html 文件有两个特点：
     *  - 内容和源文件一致
     *  - 自动引入打包生成的 js 等资源
     * 2、生成的 script 默认会加在 head 里（尾部），并且携带有 defer 属性
     *  - defer：加载后续文档的过程和 js 脚本的加载是并行进行的（异步），但 js 脚本的执行需要等到文档所有元素解析渲染完成之后，DOMContentLoaded 事件触发之前
     * 3、了解更多配置选项，去网址：https://github.com/jantimon/html-webpack-plugin
     */
    new HtmlWebpackPlugin({
      template: './index.html',
    }),

    /**
     * 定义 node 环境下的全局变量，供编译时使用
     *  - 注意：不能定义 "process.env.NODE_ENV" 为 key，与 webpack5 的默认配置有冲突
     *    - 可以参考文章：https://www.cnblogs.com/dll-ft/p/16150486.html
     */
    new webpack.DefinePlugin({
      'APP_ENV': JSON.stringify('prod'),
    }),

    /**
     * 1、Css 文件目前被打包到 js 文件中，当 js 文件加载时，会创建一个 style 标签来生成样式 ，
     *    这样对于网站来说，会出现闪屏现象，用户体验不好，我们应该是单独的 Css 文件，通过 link 标签加载性能才好
     * 2、mini-css-extract-plugin 让我们可以提取 css 为一个单独的文件
     * 3、使用的时候还需要将 loader 里的 style-loader 替换为 MiniCssExtractPlugin.loader
     */
    new MiniCssExtractPlugin({
      // 定义输出目录和文件名
      filename: 'css/[name].[contenthash:8].css',
      // 设置通过代码分割功能得到的 chunk 输出的文件名，例如 import() 动态引入文件语法，
      // 如果不写这个字段，则默认遵循 filename 字段输出的格式，写了就会覆盖掉 filename 的格式
      chunkFilename: 'css/[name].[contenthash:8].chunk.css',
    }),

    /**
     * 1、预获取/预加载文件
     *  - 使用后，可以让那些按需加载的资源预加载/预获取
     *  - 构建时会生成类似 <link rel="prefetch" href="login-modal-chunk.js"> 这样的语句，并插入到 html 模板中
     * 2、两种方式，具体可以看 readme 介绍，或参考 webpack 文档：https://webpack.docschina.org/guides/code-splitting/#prefetchingpreloading-modules
     *  - 预获取（prefetch）：将来某些导航下可能需要的资源
     *  - 预加载（preload）：当前导航下可能需要资源
     * 3、新版 webpack 已经内置了此功能，可以使用魔法注释开启此功能，具体使用参照上面的文档
     *  - 使用内置的方式在构建时不会将 link 标签插入到 html 模板中，而是在代码运行时通过 js 插入
     *  - 如果插件和内置方式同时使用，二者并不会冲突，会将各自生成的 link 标签分别插入（推荐使用插件的方式！可以全局配置）
     */
    new PreloadWebpackPlugin({
      // rel: 'prefetch', // 使用 prefetch 时，不需要 as 字段
      rel: 'preload',
      // as: 'script', // 不给 as 字段，插件会自动识别文件类型
    }),

    /**
     * 使用 PWA 离线缓存功能（除了使用这个插件，还需要在入口文件写上注册 Service Worker 的代码）
     *  - 下面的代码都是照搬官网的：https://webpack.docschina.org/guides/progressive-web-application/#adding-workbox
     */
    new WorkboxPlugin.GenerateSW({
      // 这些选项帮助快速启用 ServiceWorkers
      // 不允许遗留任何“旧的” ServiceWorkers
      clientsClaim: true,
      skipWaiting: true,
    }),
  ],

  optimization: {
    // 控制是否需要做压缩（可以在调试时使用）
    minimize: true,
    // minimizer 的默认值为 [new TerserWebpackPlugin()]，表示自动压缩 js 代码
    minimizer: [
      /**
       * 1、在 webpack5 中，可以使用 `...` 语法来访问默认值（即 `terser-webpack-plugin`），扩展现有的 minimizer，对 js 代码进行压缩，
       *    这种情况下 terser-webpack-plugin 不需要安装
       * 2、另外，如果使用的是 webpack v5 或更高版本，同时希望自定义配置，那么仍需要安装 terser-webpack-plugin，
       *    如果使用 webpack v4，则必须安装 terser-webpack-plugin v4 的版本
       * 3、压缩 js 代码，这个地方这么写，主要是为了开启多进程
       */
      // '...',
      new TerserWebpackPlugin({
        // 多进程压缩，手动设置进程数，默认也会开启多进程的，默认数量：os.cpus().length - 1
        parallel: threads,
      }),
      // 压缩 css 代码，直接写在 plugins 里面也可以，写在这效果也是一样的，规范而言，推荐写在这
      new CssMinimizerPlugin(),
    ],

    /**
     * 代码分割
     */
    splitChunks: {
      // initial 入口 chunk，对于异步导入的文件不处理
      // async 异步 chunk，只对异步导入的文件处理
      // all 全部 chunk 都处理
      // 一般情况下使用 all，并且对于 SPA 项目来说，如果没有什么特别的配置，就写一个 chunks: 'all' 即可，其它全部使用默认
      chunks: 'all',

      /**
       * 以下是默认值
       */
      // chunks: 'async', // 只对异步 chunk 进行处理
      // minSize: 20000, // 生成 chunk 的最小体积（以 bytes 为单位）
      // minRemainingSize: 0, // 确保最后提取的文件大小不能为 0，通过确保拆分后剩余的最小 chunk 体积超过限制来避免大小为零的模块
      // minChunks: 1, // 至少被引用的次数，满足条件才会被代码分割（这个引用的次数指的是：被不同的入口文件引用的次数，所以单入口项目中文件被引入的次数永远为 1）
      // maxAsyncRequests: 30, // 按需加载时最大并行请求数量
      // maxInitialRequests: 30, // 入口 js 文件最大并行请求数量
      // enforceSizeThreshold: 50000, // 超过 50kb 一定会单独打包（此时会忽略 minRemainingSize、maxAsyncRequests、maxInitialRequests）
      // // 缓存组可以继承和/或覆盖来自 splitChunks.* 的任何选项，但是 test、priority 和 reuseExistingChunk 只能在缓存组级别上进行配置
      // // 缓存组，配置哪些模块要打包到一个组
      // cacheGroups: {
      //   // 抽取第三方代码
      //   defaultVendors: { // 组名，这个名称并没有什么实际的用处，只是用来区分不同的组
      //     test: /[\\/]node_modules[\\/]/, // 正则匹配，控制此缓存组选择的模块，省略它会选择所有模块。这个也可以写成一个函数，提供更多的选择
      //     priority: -10, // 权重（值越大优先级越高），自定义组的优先级默认值为 0
      //     reuseExistingChunk: true, // 如果当前 chunk 包含已从主 bundle 中拆分出的模块，则该模块将被重用，而不是生成新的模块
      //   },
      //   // 抽取公共代码（只有在多入口时才有用）
      //   default: {
      //     minChunks: 2, // 这里的 minChunks 会覆盖掉上面默认的，其他没有写的配置会使用上面的默认值
      //     priority: -20,
      //     reuseExistingChunk: true,
      //   },
      // },

      /**
       * 自定义缓存组，没写的字段使用默认配置，写了的字段会覆盖掉默认配置
       *  - 这三个字段 test、priority 和 reuseExistingChunk 只能在缓存组级别上进行配置
       */
      cacheGroups: {
        // 分割单个文件，这个自定义组没写 priority，所以优先级默认为 0
        hundred: {
          name: 'hundred', // 生成的 bundle 名称
          minSize: 0, // 单文件体积很小，所以改下所允许的最小文件体积
          test: /hundred\.js/, // 匹配文件
          reuseExistingChunk: true,
        },
        // 覆盖掉默认的 defaultVendors 分组
        defaultVendors: {
          name: 'vendors', // 给输出的 bundle 起个名
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
        },
        // 抽取出一个公共文件（注意：并不是公共代码，单页面 SPA 项目中只有一个入口，所以不存在公共代码）
        // 注意：其实这个配置在 SPA 中是没必要的，因为 webpack 会根据默认配置或 import() 语法默认做分包
        //  - 因为这个组我们给了名字 common，造成的后果是：入口文件中引入的所有文件（不论是动态引入还是静态引入）都会被打到这个包中
        //  - 如果不给名字，就还是按默认的分包方式
        // 这里只是做演示，实际项目中一般不需要这么做
        // common: {
        //   name: 'common', // 生成的 bundle 名称
        //   minSize: 0, // 因为这个 demo 的文件体积比较小，所以改下打包生成的最小文件体积
        //   minChunks: 1, // 单入口的 SPA 项目，文件只可能被引用 1 次
        //   priority: -20,
        //   reuseExistingChunk: true,
        // },
      },
    },

    /**
     * 提取 runtime bundle 文件，用于存储输出的 bundle 文件与其 hash 值的对应关系
     *  - 在此项目中可以修改 js 目录中的 mul.js 文件做测试
     */
    runtimeChunk: {
      // 定义文件名，会作为 [name] 生成 bundle 文件
      name: (entryPoint) => `runtime-${entryPoint.name}`,
    },
  },
};
