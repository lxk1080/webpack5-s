/**
 * 异步 loader，参数和同步 loader 相同
 *  - 1、要想让一个 loader 变成异步 loader，需要在函数体内使用：this.async() 方法
 *  - 2、当异步结果响应，调用了 callback 方法后，才会进入到下一个 loader
 *  - 3、这个 callback 方法类似于 express 中间件的 next() 方法，是嵌套执行的（同步 loader 的 callback 方法也是一样）
 *  - 4、webpack 中的异步 loader 还是挺多的，因为要经常处理那种大体积的文件，同步太耗时了
 */
module.exports = function (content, map, meta) {
  console.log('async entry!')
  const callback = this.async()
  // 等待 1s 异步响应后，进入下一个 loader
  setTimeout(() => {
    console.log('async callback!')
    callback(null, content, map, meta)
    console.log('async out!')
  }, 1000)
}
