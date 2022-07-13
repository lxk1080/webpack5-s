const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    main: './src/main.js'
  },
  output: {
    // 根目录，所有文件的输出目录
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/bundle.js',
    // webpack5 清空目标文件夹不在需要引入插件
    clean: true,
  },
  module: {
    rules: [
      // css-loader：负责将 Css 文件编译成 Webpack 能识别的模块，让 Css 文件可以被引入
      // style-loader：会动态创建一个 Style 标签，里面放置 Webpack 中 Css 模块内容
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'], // 从右到左执行
      },
      // less-loader：将 Less 文件编译成 Css 文件
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader'],
      },
      // sass-loader：负责将 Sass 文件编译成 css 文件
      // sass：sass-loader 依赖 sass 进行编译
      {
        test: /\.s[ac]ss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      // stylus-loader：将 Styl 文件编译成 Css 文件
      {
        test: /\.styl$/,
        use: ['style-loader', 'css-loader', 'stylus-loader'],
      },
      // 过去在 Webpack4 时，我们处理图片资源通过 file-loader 和 url-loader 进行处理
      // 现在 Webpack5 已经将两个 Loader 功能内置到 Webpack 里了，我们只需要简单配置即可处理图片资源
      {
        test: /\.(png|jpe?g|gif|webp)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            // 小于 10kb 的图片会被 base64 处理
            // 优点：减少请求数量
            // 缺点：体积变得更大，图片自身体积越大，变成 base64 后体积就更大，所以要限制被 base64 处理的图片大小
            maxSize: 10 * 1024,
          }
        },
        generator: {
          // 将图片文件输出到 imgs 目录中
          // [hash:8]: hash 值取前 8 位
          // [ext]: 使用之前的文件扩展名
          // [query]: 添加之前的 query 参数，注意这个参数不会加在输出的文件上，在请求文件的时候会自动加上
          // @example filename: "imgs/[hash:8].png",
          filename: 'imgs/[hash:8][ext][query]',
        },
      },
      // asset/resource 发送一个单独的文件并导出 URL（启动服务下的绝对路径，例如：http://127.0.0.1/fonts/7269c5ce.ttf）。之前通过使用 file-loader 实现。
      // asset/inline 导出一个资源的 data URI。之前通过使用 url-loader 实现。
      // asset/source 导出资源的源代码。之前通过使用 raw-loader 实现。
      // asset 在导出一个 data URI 和发送一个单独的文件之间自动选择。之前通过使用 url-loader，并且配置资源体积限制实现。
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
  plugins: [],
};
