/**
 * 使用 npm run compiler 打包
 *  - 命令：npx webpack --entry ./compiler/index.js -o ./compiler/bundle --mode=development --no-devtool
 *  - 开发模式下不会压缩代码，更容易阅读，另外，去掉了 source-map 相关的代码
 */

import key, { printHello, count } from './utils'

const createComponent = () => {
  const div = document.createElement('div')

  printHello()
  console.log(key)
  count(1, 2)

  document.body.appendChild(div)
}

createComponent()
