const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    main: './src/main.js'
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
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
        }
      },
    ],
  },
  plugins: [],
};
