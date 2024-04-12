/**
 * @desc 给文件添加顶部文本注释
 *  - 其本质就是字符串拼接
 *  - 注意：由于是通过 loader 处理添加的注释，执行时机比较早，在生产模式下，后面执行的压缩功能，可能会把注释给删掉
 *    - 所以要想在生产模式输出注释，最好使用自定义插件的写法，找准时机，插入注释
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
