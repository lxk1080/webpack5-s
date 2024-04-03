const os = require('os');
const path = require('path');
const ESLintWebpackPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');

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
  mode: 'production',
  // 生产模式一般不需要代码映射，如果需要，就用这个，包含行/列映射，但是打包编译速度慢
  devtool: 'source-map',
  entry: {
    /**
     * 1、注意这个地方的相对路径
     *    - node 里面文件操作的相对路径，相对的不是这个文件，而是执行 node 命令所处的终端路径
     *    - 但是 node 模块中的路径标识是相对于当前文件模块本身的
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
                  plugins: ["@babel/plugin-transform-runtime"], // 可以减少代码体积
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
               * [contenthash:8]: hash 值取前 8 位
               * [ext]: 使用之前的文件扩展名
               * [query]: 添加之前的 query 参数，注意这个参数不会加在输出的文件上，在请求文件的时候会自动加上
               * @example filename: "imgs/[contenthash:8].png",
               */
              filename: 'imgs/[contenthash:8][ext][query]',
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
            //   filename: "fonts/[contenthash:8][ext]",
            // },
            generator: {
              filename: (content) => {
                if (
                  content.filename.includes('.ttf') ||
                  content.filename.includes('.woff')
                ) {
                  return 'fonts/[contenthash:8][ext]'
                }
                return 'media/[contenthash:8][ext]'
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
      // 开启多进程并设置进程数
      threads,
    }),

    /**
     * 1、生成的 script 默认会加在 head 里（尾部），并且携带有 defer 属性
     *    defer：
     *      加载后续文档的过程和 js 脚本的加载是并行进行的（异步），
     *      但 js 脚本的执行需要等到文档所有元素解析渲染完成之后，DOMContentLoaded 事件触发之前
     *
     * 2、了解更多配置选项，直接去：https://github.com/jantimon/html-webpack-plugin
     *
     */
    new HtmlWebpackPlugin({
      template: './index.html',
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
  ],

  optimization: {
    // minimizer 的默认值为 [new TerserWebpackPlugin()]，表示自动压缩 js 代码
    minimizer: [
      /**
       * 1、在 webpack5 中，可以使用 `...` 语法来访问默认值（即 `terser-webpack-plugin`），扩展现有的 minimizer，对 js 代码进行压缩，
       *    这种情况下 terser-webpack-plugin 不需要安装
       * 2、另外，如果使用的是 webpack v5 或更高版本，同时希望自定义配置，那么仍需要安装 terser-webpack-plugin，
       *    如果使用 webpack v4，则必须安装 terser-webpack-plugin v4 的版本
       * 3、这个地方这么写，主要是为了开启多进程
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
    // splitChunks: {
    //   chunks: 'all',
    // },
  },
};
