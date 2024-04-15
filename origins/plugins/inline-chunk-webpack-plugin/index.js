/**
 * @desc 将打包生成的某些小文件，直接以内联的方式插入到 html 中，以减少请求数量
 *  - 写这个插件的关键在于，要操作 html 模板，那就离不开 html-webpack-plugin，我们可以借助它的力量去做我们要做的
 *    - 事实上，我们也不得不借助 html-webpack-plugin 的力量，因为如果我们自己做修改，很可能被 html-webpack-plugin 覆盖掉
 */

// 我们并不直接使用 HtmlWebpackPlugin 插件，而是需要使用它提供的钩子，所以用这种引入的方式
const HtmlWebpackPlugin = require('safe-require')('html-webpack-plugin')

class InlineChunkWebpackPlugin {
  constructor(nameRegExps) {
    // 可以传递多个文件名匹配表达式
    this.nameRegExps = nameRegExps || []
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('InlineChunkWebpackPlugin', (compilation) => {
      // 1、获取 html-webpack-plugin 的 hooks（注意：getHooks 这个方法在不同版本的 html-webpack-plugin 插件中名称可能不一样）
      const hooks = HtmlWebpackPlugin.getHooks(compilation)

      // 2、注册 html-webpack-plugin 的 hooks -> alterAssetTagGroups（这个钩子对应的阶段是 head 标签和 body 标签刚分好组）
      hooks.alterAssetTagGroups.tap('InlineChunkWebpackPlugin', (assets) => {
        // 3、把文件从 src 引用的方式改为 inline 内联的方式
        // headTags 和 bodyTags 都是数组，里面装着一个个的 Tag 对象，对象上有这个 Tag 的各个属性
        // 我们只需要修改这些 Tag 的属性即可，至于怎么 inline 插入，html-webpack-plugin 会帮我们做
        assets.headTags = this.doInlineOperation(assets.headTags, compilation.assets)
        assets.bodyTags = this.doInlineOperation(assets.bodyTags, compilation.assets)
      })

      // 4、最后，我们删除原来的文件（因为不需要再引用了）
      //    - 这里你可能会问？我都已经改了 Tag 的属性，为啥还会生成文件？
      //      - 你要搞清楚一件事，生成文件是 webpack 做的，html-webpack-plugin 做的是：以何种方式加载此文件
      //    - afterEmit 这个钩子是说：html-webpack-plugin 要做的事已经完成了，把文件控制转交给了 webpack，这和 webpack 的 emit 钩子不一样哈
      hooks.afterEmit.tap('InlineChunkWebpackPlugin', () => {
        Object.keys(compilation.assets).forEach((filepath) => {
          if (this.nameRegExps.some((regExp) => regExp.test(filepath))) {
            delete compilation.assets[filepath]
          }
        })
      })
    })
  }

  doInlineOperation(tags, assets) {
    /*
      目前：
        [
          {
            tagName: 'script',
            voidTag: false,
            meta: { plugin: 'html-webpack-plugin' },
            attributes: { defer: true, type: undefined, src: 'js/runtime~main.js.js' }
          },
        ]
      修改为：
        [
          {
            tagName: 'script',
            innerHTML: runtime文件的内容
            closeTag: true
          },
        ]
    */

    return tags.map((tag) => {
      // 我们只需要操作 script 标签，其它的不管
      if (tag.tagName !== 'script') return tag
      // 获取文件资源路径
      const filepath = tag.attributes.src
      // 没有 src 属性的，不管
      if (!filepath) return tag

      // 并不在我们选择的文件范围内的，不管
      if (!this.nameRegExps.some((regExp) => regExp.test(filepath))) return tag

      // 匹配到的，我们将其修改为 inline 方法（只需要改属性即可，剩下的 html-webpack-plugin 会帮我们处理）
      return {
        tagName: 'script',
        innerHTML: assets[filepath].source(),
        closeTag: true,
      }
    })
  }
}

module.exports = InlineChunkWebpackPlugin
