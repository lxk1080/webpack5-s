/**
 * Pitching Loader
 *  - 要注意 pitch 方法和 normal 方法的执行顺序
 *    - 从左到右执行 pitch 方法，然后再从右到左执行 normal 方法
 *    - 在这个过程中如果任何 pitch 有返回值，则 loader 链被阻断，webpack 会跳过后面所有的 pitch 和 normal，直接进入到上一个 loader 的 normal 方法
 */
module.exports = function (content) {
  console.log('normal 1')
  return content
}
module.exports.pitch = function (remainingRequest, precedingRequest, data) {
  console.log('pitch 1')
}
