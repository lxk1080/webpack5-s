const path = require("path");
const ESLintWebpackPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const WebpackHelper = require("./config/WebpackHelper");

console.log('process.env.NODE_ENV ==>', process.env.NODE_ENV);

const devHelper = new WebpackHelper({
  // 将样式插入到 style 标签中
  cssInsertMode: 'style-loader',
});

module.exports = {
  mode: "development",
  // 打包编译速度相对快，只包含行映射，没有列映射
  devtool: "cheap-module-source-map",
  // 关闭性能分析，提升速度
  performance: false,
  entry: path.resolve(__dirname, "./src/main.js"),
  output: {
    path: undefined, // 开发模式无输出，无需定义
    filename: "static/js/[name].js", // 初始 chunk 的输出。这里定义的路径，在页面调试时，通过 Sources 可以看到
    chunkFilename: "static/js/[name].chunk.js", // 非初始 chunk 的输出
    assetModuleFilename: "static/media/[hash:10][ext][query]", // 统一设置媒体文件的输出（图片、字体、音乐、视频）
  },
  devServer: {
    open: true,
    host: "localhost",
    port: 3000,
    hot: true,
    compress: true,
    historyApiFallback: true, // 解决 react-router 子路由刷新 404 的问题，也就是通过这个让服务每次返回 index.html 文件
  },
  module: {
    rules: [
      {
        oneOf: [
          {
            test: /\.css$/,
            // 数组里面 Loader 执行顺序是从右到左
            use: devHelper.getStyleLoaders(),
          },
          {
            test: /\.less$/,
            use: devHelper.getStyleLoaders("less-loader"),
          },
          {
            test: /\.s[ac]ss$/,
            use: devHelper.getStyleLoaders("sass-loader"),
          },
          {
            test: /\.styl$/,
            use: devHelper.getStyleLoaders("stylus-loader"),
          },
          {
            test: /\.(png|jpe?g|gif|svg)$/,
            type: "asset",
            parser: {
              dataUrlCondition: {
                maxSize: 10 * 1024, // 小于 10kb 的图片会被 base64 处理
              },
            },
          },
          {
            test: /\.(ttf|woff2?|mp3|mp4)$/,
            type: "asset/resource",
          },
          {
            test: /\.(jsx|js)$/,
            include: path.resolve(__dirname, "./src"),
            loader: "babel-loader",
            options: {
              cacheDirectory: true, // 开启 babel 编译缓存
              cacheCompression: false, // 缓存文件不要被压缩
              plugins: [
                // "@babel/plugin-transform-runtime", // 减小代码体积，presets 中已经包含此功能
                "react-refresh/babel", // 开启 js 的 HMR 功能，配合下面的插件使用
              ],
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new ESLintWebpackPlugin({
      context: path.resolve(__dirname, "./src"),
      exclude: "node_modules",
      cache: true,
      cacheLocation: path.resolve(
        __dirname,
        "./node_modules/.cache/.eslintcache"
      ),
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "./public/index.html"),
    }),
    // 可解决 js 的 HMR 功能运行时全局变量的问题，配合上面 babel-loader 的 options.plugins 使用
    new ReactRefreshWebpackPlugin(),
    // 复制静态资源
    new CopyPlugin({
      patterns: [
        {
          // 将导航图标复制到 dist 目录中去
          from: path.join(__dirname, "public/favicon.ico"),
          to: path.resolve(__dirname, "./dist"),
        },
      ],
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: "all",
    },
    runtimeChunk: {
      name: (entrypoint) => `runtime-hash-${entrypoint.name}`,
    },
  },
  resolve: {
    // 自动补全文件扩展名，让 jsx 可以使用，会从左到右按顺序补全尝试
    extensions: [".jsx", ".js", ".json"],
  },
};
