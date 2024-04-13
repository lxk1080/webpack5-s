const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const TestWebpackPlugin = require('./plugins/test-webpack-plugin')
const BannerWebpackPlugin = require('./plugins/banner-webpack-plugin')
const CleanWebpackPlugin = require('./plugins/clean-webpack-plugin')
const AnalyzeWebpackPlugin = require('./plugins/analyze-webpack-plugin')
const InlineChunkWebpackPlugin = require('./plugins/inline-chunk-webpack-plugin')

// 终端路径
console.log('path.resolve ==>', path.resolve())
// 通过这个可以找到执行 webpack 时，实际执行的 nodejs 文件
console.log('process.argv ==>', process.argv)

module.exports = {
  // 开发模式，调试使用，使用这个模式，不会压缩代码
  mode: 'development',
  // mode: 'production',
  entry: {
    main: path.resolve(__dirname, './src/main.js'),
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    // 解决 inline-chunk-webpack-plugin 在 inline 化文件后，通过 devServer 在浏览器运行时的报错：
    //  - Automatic publicPath is not supported in this browser
    // 这个报错只有在通过 devServer 启动时才有哈，通过提示可知，加上 publicPath: '' 即可解决错误
    publicPath: '',
    filename: 'js/[name].[contenthash:8].js',
    // clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,

        // 同步 loader
        // use: ['./loaders/sync-loader'],

        // 异步 loader
        // use: ['./loaders/sync-loader', './loaders/async-loader'],

        // raw loader
        // use: ['./loaders/raw-loader'],

        // pitching loader
        // use: ['./loaders/pitching-loader/p1', './loaders/pitching-loader/p2', './loaders/pitching-loader/p3'],

        // 自定义的 clean-log-loader
        // use: ['./loaders/clean-log-loader'],

        // 自定义的 banner-loader
        // use: {
        //   loader: './loaders/banner-loader',
        //   options: {
        //     author: 'zerol',
        //   },
        // },

        // 自定义的 babel-loader
        use: {
          loader: './loaders/babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.(png|jpe?g|gif)$/,
        loader: './loaders/file-loader', // 自定义的 file-loader
        type: 'javascript/auto', // 阻止 webpack 默认处理图片资源，只使用自定义的 file-loader 处理
      },
      {
        test: /\.css$/,
        // use: ['style-loader', 'css-loader'], // 官方 loader
        use: ['./loaders/style-loader', 'css-loader'], // 自定义的 style-loader
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './src/public/index.html'),
    }),

    // 自定义插件测试
    // new TestWebpackPlugin(),

    // 自定义的 banner-webpack-plugin
    new BannerWebpackPlugin({
      author: 'zerol',
      version: '1.0.0',
      date: new Date().toString(),
    }),

    // 自定义的 clean-webpack-plugin，可以解决 banner-webpack-plugin 中存在的问题
    new CleanWebpackPlugin(),

    // 自定义的 analyze-webpack-plugin，输出资源大小分析
    new AnalyzeWebpackPlugin(),

    // 自定义的 inline-chunk-webpack-plugin，可以将 src 引用文件的方式改成 inline script 的方式
    new InlineChunkWebpackPlugin([
      /runtime-hash-(.*)\.js/,
    ]),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
    runtimeChunk: {
      name: entryPoint => `runtime-hash-${entryPoint.name}`,
    },
  },
  devServer: {
    host: '127.0.0.1',
    port: 3000,
    open: true,
    hot: true,
  },
}
