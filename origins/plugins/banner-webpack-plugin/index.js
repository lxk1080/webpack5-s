/**
 * @desc 给输出的打包文件添加注释
 *  - 几个重要的点：
 *    - 1、使用 compiler.hooks.emit 钩子（输出 asset 到 output 目录之后执行）
 *        - 需要在打包输出前添加注释，因为太早添加的话，可能会在代码被压缩的时候把注释删掉
 *    - 2、使用 compilation.assets 获取即将输出的资源文件
 *    - 3、如果直接在 emit 钩子内做 compilation.assets 的修改，webpack 打包时会提示：后面的版本不给修改了，希望我们换种写法，
 *         说修改 assets 相关必须在 sealing 阶段，也就是从 seal 到 afterSeal 之间的阶段，
 *         我们查阅文档，发现 sealing 阶段有个钩子 afterOptimizeAssets，就拿它试试吧，
 *         然后，需要注意的是，要使用 compilation.hooks，从生命周期来看，compiler.hooks 必须要在 make 或之前，
 *         在 make 之后的 compiler.hooks 是不会做 compilation 操作的，所以这里我们选择 compiler.hooks.make，
 *         所以最终，我们可以选择 compiler.hooks.make 和 compilation.hooks.afterOptimizeAssets 的配合做测试，
 *         结果发现是 OK 的，提示没有了！
 *         不过这里我们依然还是使用 emit 钩子完成插件功能吧，等后面哪天这种方法不给用了再说。
 *    - 4、注意！：其实这个插件是有问题的（注释掉的那种方式也有问题）：
 *        - 我们添加了文件注释之后，文件内容发生了改变，但是 contenthash 并没有改变。。。
 *        - 这时你就问了：hash 没变就没变白，那又怎样？
 *        - 其实是有问题的，问题就出在了 output.clean 身上
 *          - 我们一般都会设置 clean: true，这个属性查阅官方文档，说是在生成文件之前清空 output 目录
 *          - 但其实，它并不单纯，它并没有在再次构建前简单直接的清空 dist 目录
 *          - 当我们设置 filename 为 [name].[contenthash:8].js 的时候（用上了 contenthash 这个可替换值）
 *          - 如果下一次构建生成的文件，它的 contenthash 没有发生变化，那么之前的文件并不会被清除，而是继续延用，webpack 认为文件并未发生改变！
 *          - 所以，我们的这个插件虽然修改了文件内容，但是没有修改 hash，就会有问题：
 *            - 修改插件预设注释或修改传递给插件的参数，打包的内容并不会发生改变（这看起来就跟插件没有生效一样）
 *          - 要解决这个问题，目前有两个方法：
 *            - 1、自己写个清空 dist 插件，确保每次构建前是真的清空文件
 *            - 2、不要使用各种 hash 值去命名文件，因为 webpack 会根据 hash 去判断文件内容有没有变化，从而决定要不要清除原文件
 *                - 但是这个方式不太现实，我们上生产需要依赖 hash 值做缓存，是不可能不用 hash 的，所以最好还是写插件解决吧
 *          - 当然正确的解决方法应该是在插件中修改，修改文件内容的同时，同步修改 hash 值，但这个目前不会。。
 */
class BannerWebpackPlugin {
  constructor(options = {}) {
    this.options = options
  }

  apply(compiler) {
    // 在资源输出之前触发（我们需要在资源即将输出之前添加注释）
    // emit 是异步钩子，可以使用 tap、tapAsync、tapPromise，但因为里面没有异步操作，所以使用 tap，这样最简单
    // 如果想使用 compilation.hooks.afterOptimizeAssets，这里就换成 make 钩子
    compiler.hooks.emit.tap('BannerWebpackPlugin', (compilation) => {
      // debugger

      // 我们只处理 css 和 js 文件
      const extensions = ['css', 'js']

      // 1. 获取即将输出的资源文件：compilation.assets。该属性是一个对象，key 是文件名，value 是文件相关内容
      // 2. 过滤只保留 js 和 css 资源文件名
      const assetsKeys = Object.keys(compilation.assets).filter((assetPath) => {
        const splitted = assetPath.split(".")
        const extension = splitted[splitted.length - 1]
        return extensions.includes(extension)
      })

      // 通过传递的参数生成注释
      let str = ''
      for (let [key, value] of Object.entries(this.options)) {
        str += `\n * ${key}: ${value}`
      }
      const prefix = `/**${str}\n */\n`

      // 3. 遍历资源添加上注释
      assetsKeys.forEach((filePath) => {
        // 获取原来的内容
        const source = compilation.assets[filePath].source()
        // 拼接上注释
        const newSource = prefix + source

        // 修改资源方法
        compilation.assets[filePath] = {
          // 最终资源输出时，是调用 source 方法，source 方法的返回值就是资源的具体内容
          source() {
            return newSource
          },
          // 资源大小也得修改下
          size() {
            return newSource.length
          },
        }
      })

      /**
       * 使用此方式，webpack 打包时不会有警告提示，注意上面的 compiler.hooks 需要换成 make
       */
      /*compilation.hooks.afterOptimizeAssets.tap('BannerWebpackPlugin', (assets) => {
        // 我们只处理 css 和 js 文件
        const extensions = ['css', 'js']

        // 1. 获取即将输出的资源文件：compilation.assets。该属性是一个对象，key 是文件名，value 是文件相关内容
        // 2. 过滤只保留 js 和 css 资源文件名
        const assetsKeys = Object.keys(assets).filter((assetPath) => {
          const splitted = assetPath.split(".")
          const extension = splitted[splitted.length - 1]
          return extensions.includes(extension)
        })

        // 获取传递的参数生成注释
        let str = ''
        for (let [key, value] of Object.entries(this.options)) {
          str += `\n * ${key}: ${value}`
        }
        const prefix = `/**${str}\n *!/\n`

        // 3. 遍历资源添加上注释
        assetsKeys.forEach((filePath) => {
          // 获取原来的内容
          const source = assets[filePath].source()
          // 拼接上注释
          const newSource = prefix + source

          // 修改资源方法
          assets[filePath] = {
            // 最终资源输出时，是调用 source 方法，source 方法的返回值就是资源的具体内容
            source() {
              return newSource
            },
            // 资源大小也得修改下
            size() {
              return newSource.length
            },
          }
        })
      })*/
      // 以上
    })
  }
}

module.exports = BannerWebpackPlugin
