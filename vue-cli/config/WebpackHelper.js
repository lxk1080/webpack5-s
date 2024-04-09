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
    if (loaderName === 'sass-loader') {
      preLoader = {
        loader: loaderName,
        options: {
          // 自定义主题：自动引入我们定义的 scss 文件
          additionalData: `@use "@/styles/element/index.scss" as *;`,
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
  }
}

module.exports = WebpackHelper
