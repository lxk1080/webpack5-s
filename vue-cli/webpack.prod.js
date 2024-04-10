const path = require("path");
const ESLintWebpackPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const { DefinePlugin } = require("webpack");
const { VueLoaderPlugin } = require("vue-loader");
const AutoImport = require("unplugin-auto-import/webpack");
const Components = require("unplugin-vue-components/webpack");
const { ElementPlusResolver } = require("unplugin-vue-components/resolvers");
const WebpackHelper = require("./config/WebpackHelper");

console.log('process.env.NODE_ENV ==>', process.env.NODE_ENV);

const prodHelper = new WebpackHelper({
  // 提取样式为单独的 css 文件，在 vue 中还是使用这个 loader
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
        test: /\.js$/,
        include: path.resolve(__dirname, "./src"),
        loader: "babel-loader",
        options: {
          cacheDirectory: true, // 开启 babel 编译缓存
          cacheCompression: false, // 缓存文件不要被压缩
        },
      },
      {
        test: /\.vue$/,
        // vue-loader 不支持 oneOf 功能
        // 需要配合 VueLoaderPlugin 才能编译 vue 文件
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
    // css、js 压缩
    minimizer: [
      new CssMinimizerPlugin(),
      new TerserWebpackPlugin(),
    ],
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        // 如果项目中使用 Element Plus，此时将所有 node_modules 打包在一起，那么打包输出文件会比较大
        // 所以我们将 node_modules 中比较大的模块单独打包，从而并行加载速度更好
        // 如果项目中没有，就删除掉
        elementPlus: {
          name: "element-plus",
          test: /[\\/]node_modules[\\/]element-plus[\\/]/,
          priority: 30,
        },
        // 将 vue 相关的库单独打包，减少 node_modules 的 chunk 体积
        vue: {
          name: "vue",
          test: /[\\/]node_modules[\\/]vue(.*)?[\\/]/,
          priority: 20,
          chunks: "initial", // 只对入口 chunk 进行处理
        },
        // 其它的第三方库打包到一起
        // 这个项目打包并未生成 vendors 对应的 bundle，是因为引入的第三方 module 单个体积都是小于默认的 minSize 的（20KB），所以未进行抽离
        //  - 要是想进行抽离，将 minSize 的值设置更小即可（这里是不建议设置更小的，因为分成了多个小文件，会增加请求次数）
        vendors: {
          name: "vendors",
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          chunks: "initial",
          // minSize: 1024,
        },
      },
    },
    // 提取 runtime bundle 文件，用于存储输出的 bundle 文件与其 hash 值的对应关系
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
