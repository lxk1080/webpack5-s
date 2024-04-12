/**
 * @desc 打包输出资源大小分析，输出一个 md 文件
 *  - 这个很简单，只要就是使用 compilation.assets 得到资源信息，然后输出为 md 即可
 *  - 不需要自己创建 md 文件，利用 assets 可以让 webpack 帮忙创建文件
 */
class AnalyzeWebpackPlugin {
  apply(compiler) {
    compiler.hooks.emit.tap('AnalyzeWebpackPlugin', (compilation) => {
      // 1、遍历所有即将输出文件，得到其大小
      const assetsEntries = Object.entries(compilation.assets)

      // 2、生成 md 文件内容（加点样式，让看起来更炫酷）
      /*
        markdown 中表格语法：
          | 资源名称 | 资源大小 |
          | --- | --- |
          | xxx.js | 10kb |
      */

      let content = `### 资源大小分析 \n| 资源名称 | 资源大小 |\n| --- | --- |`

      assetsEntries.forEach(([filename, file]) => {
        const filenameShow = `<span style="background: #333; border-radius: 6px; padding: 5px 8px">${filename}</span>`
        const size = Math.ceil(file.size() / 1024)
        const sizeShow = `<div style="color: ${size < 50 ? 'green' : (size < 100 ? 'yellow' : 'red')}">${size} kb</div>`
        content += `\n| ${filenameShow} | ${sizeShow} |`
      })

      // 3、让 webpack 帮忙生成文件
      compilation.assets['analyze.md'] = {
        source() {
          return content
        },
        size() {
          return content.length
        },
      }
    })
  }
}

module.exports = AnalyzeWebpackPlugin
