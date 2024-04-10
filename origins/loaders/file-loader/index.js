/**
 * @desc 实现 file-loader 的功能，将文件原封不动输出出去（图片）
 *  - 需要处理图片、字体等文件，它们都是 buffer 数据，所以使用 raw loader
 *  - 借助工具 loader-utils 生成结构型文件名
 *  - 返回 module.exports = xxx 这种形式，模拟一个模块的导出，使其可以被 import 调用
 */
const loaderUtils = require('loader-utils')

module.exports = function (content) {
  // content 已被转化成 buffer 数据
  // 1. 根据文件内容生成带 hash 值的文件名
  const interpolatedName = loaderUtils.interpolateName(this, 'imgs/[hash].[ext][query]', {
    content,
  })
  // 2. 将文件输出出去，参数：文件名、文件内容
  this.emitFile(interpolatedName, content)
  // 3. 返回：module.exports = "文件路径（文件名）"
  return `module.exports = "${interpolatedName}"`
}

// 使用 raw loader 将 content 转成 buffer 数据
module.exports.raw = true
