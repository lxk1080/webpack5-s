const path = require('path');
const ESLintWebpackPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
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
     * 根目录，所有文件的输出目录。开发模式没有输出，不需要指定输出目录，下面的配置都可以注释掉
     */
    // path: path.resolve(__dirname, 'dist'),
    // filename: 'js/bundle.js',
    /**
     * webpack5 清空目标文件夹不再需要引入插件。开发模式使用 devServer，不生成 dist 目录，所以不需要这句
     */
    // clean: true,
  },
  /**
   * 1、在开发环境配置 devServer，启动一个服务，当文件被修改时会自动重新编译
   * 2、webpack5 使用 webpack serve 启动，webpack4 使用 webpack-dev-server
   * 3、使用开发服务器时，所有代码都会在内存中编译打包，并不会输出到 dist 目录下
   */
  devServer: {
    host: '127.0.0.1',
    port: 3000,
    open: true,
  },
  module: {
    rules: [
      /**
       * webpack 只支持 es module（ import & export ），并不支持编译 es6 语法
       * 编译需要使用 babel-loader，配置写在了 .babelrc.js 文件
       */
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      /**
       * css-loader：负责将 Css 文件编译成 Webpack 能识别的模块，让 Css 文件可以被引入
       * style-loader：会动态创建一个 Style 标签，里面放置 Webpack 中 Css 模块内容
       */
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'], // 从右到左执行
      },
      /**
       * less-loader：将 Less 文件编译成 Css 文件
       */
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader'],
      },
      /**
       * sass-loader：负责将 Sass 文件编译成 css 文件
       * sass：sass-loader 依赖 sass 进行编译
       */
      {
        test: /\.s[ac]ss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      /**
       * stylus-loader：将 Styl 文件编译成 Css 文件
       */
      {
        test: /\.styl$/,
        use: ['style-loader', 'css-loader', 'stylus-loader'],
      },
      /**
       * 过去在 Webpack4 时，我们处理图片资源通过 file-loader 和 url-loader 进行处理
       * 现在 Webpack5 已经将两个 Loader 功能内置到 Webpack 里了，我们只需要简单配置即可处理图片资源
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
      // 路径 ./ 代表的就是 src 文件夹内部
      exclude: './eslint-test',
    }),
    /**
     * 生成的 script 默认会加在 head 里（尾部），并且携带有 defer 属性
     *    defer：
     *      加载后续文档的过程和 js 脚本的加载是并行进行的（异步），
     *      但 js 脚本的执行需要等到文档所有元素解析渲染完成之后，DOMContentLoaded 事件触发之前
     *
     * 了解更多配置选项，直接去：https://github.com/jantimon/html-webpack-plugin
     *
     */
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
  ],
};
