/**
 * 同步 loader，方式一，直接返回处理后的内容，简单、快速
 */
// module.exports = function (content, map, meta) {
//   return content
// }

/**
 * 同步 loader，方式二，使用 this.callback，可以传递更多参数
 *  - 这个 this 就是 webpack 配置内容对应的 webpack 对象
 *  - 这个 callback 方法类似于 express 中间件的 next() 方法，是嵌套执行的（异步 loader 的 callback 方法也是一样）
 *  - 四个参数：
 *    - 第一个：err，代表是否有错误，没有就传 null
 *    - 第二个：content，是处理后的内容
 *    - 第三个：map，可以继续传递 source-map，让 source-map 不中断
 *    - 第四个：meta，可以给下一个 loader 传递参数
 */
module.exports = function (content, map, meta) {
  console.log('sync entry!')
  this.callback(null, content, map, meta)
  console.log('sync out!')
  // 当调用 callback() 函数时，总是返回 undefined，不论你返回啥都没用
  // return
}

/**
 * @plus 注意：在同步 loader 中不能进行异步操作
 */
