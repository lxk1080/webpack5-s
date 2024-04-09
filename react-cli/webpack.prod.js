const path = require("path");
const ESLintWebpackPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const WebpackHelper = require("./config/WebpackHelper");

console.log('process.env.NODE_ENV ==>', process.env.NODE_ENV);

const prodHelper = new WebpackHelper({
  // 通过 link 标签加载 css 样式
  cssInsertMode: MiniCssExtractPlugin.loader,
});

module.exports = {
  mode: "production",
  // 生产模式一般不需要代码映射，如果需要，就用这个，包含行/列映射，但是打包编译速度慢
  devtool: "source-map",
  // 关闭性能分析，提升速度
  performance: false,
  entry: path.resolve(__dirname, "./src/main.js"),
  output: {
    path: path.resolve(__dirname, "./dist"), // 输出目录
    filename: "static/js/[name].[contenthash:10].js", // 初始 chunk 的输出文件名，默认输出文件名
    chunkFilename: "static/js/[name].[contenthash:10].chunk.js", // 非初始 chunk 的输出文件名
    assetModuleFilename: "static/media/[hash:10][ext][query]", // 统一设置媒体文件的输出文件名
    clean: true, // 自动清空打包目录
  },
  module: {
    rules: [
      {
        oneOf: [
          {
            test: /\.css$/,
            // 执行顺序是从右到左
            use: prodHelper.getStyleLoaders(),
          },
          {
            test: /\.less$/,
            use: prodHelper.getStyleLoaders("less-loader"),
          },
          {
            test: /\.s[ac]ss$/,
            use: prodHelper.getStyleLoaders("sass-loader"),
          },
          {
            test: /\.styl$/,
            use: prodHelper.getStyleLoaders("stylus-loader"),
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
                // "@babel/plugin-transform-runtime" // 减小代码体积，presets 中已经包含此功能
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
    new MiniCssExtractPlugin({
      filename: "static/css/[name].[contenthash:10].css",
      chunkFilename: "static/css/[name].[contenthash:10].chunk.css",
    }),
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
    // css、js 压缩
    minimizer: [
      new CssMinimizerPlugin(),
      new TerserWebpackPlugin(),
    ],
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        // 如果项目中使用 antd，此时将所有 node_modules 打包在一起，那么打包输出文件会比较大
        // 所以我们将 node_modules 中比较大的模块单独打包，从而并行加载速度更好
        // 如果项目中没有，就删除掉
        antd: {
          name: "antd",
          test: /[\\/]node_modules[\\/]antd(.*)/,
          priority: 30,
        },
        // 将 react 相关的库单独打包，减少 node_modules 的 chunk 体积
        react: {
          name: "react",
          test: /[\\/]node_modules[\\/]react(.*)?[\\/]/,
          priority: 20,
          chunks: "initial", // 只对入口 chunk 进行处理
        },
        // 其它的第三方库打包到一起
        vendors: {
          name: "vendors",
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          chunks: "initial",
        },
      },
    },
    // 提取 runtime bundle 文件，用于存储输出的 bundle 文件与其 hash 值的对应关系
    runtimeChunk: {
      name: (entrypoint) => `runtime-hash-${entrypoint.name}`,
    },
  },
  resolve: {
    // 自动补全文件扩展名，让 jsx 可以使用，会从左到右按顺序补全尝试
    extensions: [".jsx", ".js", ".json"],
  },
};
