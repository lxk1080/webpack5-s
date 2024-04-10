/**
 * @desc 给文件添加顶部文本注释
 *  - 其本质就是字符串拼接
 */
const schema = require('./schema.json')

module.exports = function (content) {
  // 获取 loader 的 options，同时对 options 内容进行校验
  // schema 是 options 的校验规则（符合 JSON schema 规则）
  const options = this.getOptions(schema)

  const prefix = `
    /*
    * Author: ${options.author}
    */
  `

  return `${prefix} \n ${content}`
}
