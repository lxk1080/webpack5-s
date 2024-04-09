const path = require("path");
const ESLintWebpackPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const { DefinePlugin } = require("webpack");
const { VueLoaderPlugin } = require("vue-loader");
const AutoImport = require("unplugin-auto-import/webpack");
const Components = require("unplugin-vue-components/webpack");
const { ElementPlusResolver } = require("unplugin-vue-components/resolvers");
const WebpackHelper = require("./config/WebpackHelper");

console.log('process.env.NODE_ENV ==>', process.env.NODE_ENV);

const devHelper = new WebpackHelper({
  // 将样式插入到 style 标签中，注意在 vue 中要使用 vue-style-loader，会提供 HMR 功能
  cssInsertMode: 'vue-style-loader',
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
        test: /\.js$/,
        include: path.resolve(__dirname, "./src"),
        loader: "babel-loader",
        options: {
          cacheDirectory: true, // 开启 babel 编译缓存
          cacheCompression: false, // 缓存文件不要被压缩
        },
      },
      /**
       * 关于 vue-loader
       *  - 不支持 oneOf 功能
       *  - 内部会给 vue 文件注入 HMR 功能代码
       *  - 需要配合 VueLoaderPlugin 才能编译 vue 文件
       */
      {
        test: /\.vue$/,
        loader: "vue-loader",
        options: {
          // 开启编译缓存
          cacheDirectory: path.resolve(__dirname, "node_modules/.cache/vue-loader"),
        },
      },
    ],
  },
  plugins: [
    // 配合 vue-loader 编译 vue 文件
    new VueLoaderPlugin(),
    // eslint 配置
    new ESLintWebpackPlugin({
      context: path.resolve(__dirname, "./src"),
      exclude: "node_modules",
      cache: true,
      cacheLocation: path.resolve(__dirname, "./node_modules/.cache/.eslintcache"),
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "./public/index.html"),
    }),
    // 定义几个全局变量，解决 vue 页面提示警告的问题
    // 这些变量都是 vue 提示的，似乎和 tree-shaking 有关
    new DefinePlugin({
      __VUE_OPTIONS_API__: "true",
      __VUE_PROD_DEVTOOLS__: "false",
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "false",
    }),
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
    // ElementPlus 配置：按需加载 element-plus 组件样式
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    // ElementPlus 配置：自定义主题，还需要对 sass-loader 进行 options 的配置
    Components({
      resolvers: [
        ElementPlusResolver({
          importStyle: "sass",
        }),
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
    // 自动补全文件扩展名，会从左到右按顺序补全尝试
    extensions: [".vue", ".js", ".json"],
    // 配置路径别名
    alias: {
      "@": path.resolve(__dirname, 'src'),
    },
  },
};
