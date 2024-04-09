/**
 * 1、此文件只抽取公共代码，不做开发模式和生产模式的判断
 * 2、不同模式下的参数，由调用方传递，这样子所有的区别，都能在调用方文件中看到
 */
class WebpackHelper {
  constructor({ cssInsertMode }) {
    this.cssInsertMode = cssInsertMode // 以何种方式加载 css 代码
  }

  getStyleLoaders(loaderName) {
    let preLoader = loaderName
    if (loaderName === 'less-loader') {
      preLoader = {
        loader: loaderName,
        options: {
          lessOptions: {
            // 解决 antd 中 Inline JavaScript is not enabled 问题
            javascriptEnabled: true,
            // 设置 antd 的自定义主题，这个了解下即可，最新版 antd 可以直接在代码中修改主题颜色
            // 修改后需要引入 antd 的 .less 样式文件（之前引入的是 .css 文件）
            modifyVars: {
              "@primary-color": "#eb2f96", // 全局主色
            },
          },
        },
      }
    }
    return [
      this.cssInsertMode,
      "css-loader",
      {
        loader: "postcss-loader",
        options: {
          postcssOptions: {
            plugins: [
              "postcss-preset-env", // 能解决大多数样式兼容性问题
            ],
          },
        },
      },
      preLoader,
    ].filter(Boolean);
  };
}

module.exports = WebpackHelper
