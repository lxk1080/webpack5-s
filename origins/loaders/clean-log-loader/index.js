/**
 * @desc 清理 js 代码中的 console.log
 *  - 本质就是字符串的替换
 */
module.exports = function (content) {
  return content.replace(/console\.log\(.*\);?/g, '')
}
