const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

// 终端路径
console.log('path.resolve ==>', path.resolve())

module.exports = {
  mode: 'development',
  entry: {
    main: path.resolve(__dirname, './src/main.js'),
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'js/[name].[contenthash:8].js',
    clean: true,
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

        // clean-log-loader
        // use: ['./loaders/clean-log-loader'],

        // comment-loader
        // use: {
        //   loader: './loaders/comment-loader',
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
        use: ["./loaders/style-loader", "css-loader"], // 自定义的 style-loader
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './src/public/index.html'),
    })
  ],
  devServer: {
    host: '127.0.0.1',
    port: 3000,
    open: true,
    hot: true,
  },
}
