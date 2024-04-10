/**
 * @desc 模拟 babel-loader 的功能
 *  - 主要是借助 babel 提供的工具对代码进行编译
 *  - 需要安装 @babel/core 和 @babel/preset-env
 *  - 官网文档：https://www.babeljs.cn/docs/babel-core
 */
const babel = require("@babel/core")
const schema = require("./schema.json")

module.exports = function (content) {
  // 使用异步 loader
  const callback = this.async()
  const options = this.getOptions(schema)

  // 使用 babel 对代码进行编译
  babel.transform(content, options, function (err, result) {
    if (err) return callback(err)
    callback(null, result.code)
  })
}
