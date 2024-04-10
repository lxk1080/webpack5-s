/**
 * Raw Loader
 *  - 默认情况下，资源文件会被转化为 UTF-8 字符串，然后传给 loader。通过设置 raw 为 true，loader 可以接收原始的 Buffer 数据
 *  - 其实就是给函数一个静态属性 raw 并赋值为 true
 */
module.exports = function (content) {
  // content 是一个 Buffer 数据
  console.log('content ==>', content)
  return content
}

module.exports.raw = true // 开启 Raw Loader
