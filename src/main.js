import count from './js/count'
import sum from './js/sum'
import './css/iconfont.css'
import './css/index.css'
import './less/index.less'
import './sass/index.sass'
import './sass/index.scss'
import './styl/index.styl'
import gwr from './media/lightPollution.mp4'
import num from './eslint-test'
import _ from 'lodash'

console.log(count(2, 1))
console.log(sum(1, 2, 3, 4))

// 测试 eslint
console.log(num)

// 测试视频资源的处理
createVideo()

function createVideo() {
  const video = document.createElement('video')
  video.width = 400
  video.autoplay = 'autoplay'
  // 谷歌浏览器和火狐浏览器现在都不支持非静音自动播放
  // 必须加上 muted 属性，否则 autoplay 无效，无法自动播放
  video.muted = 'muted'
  video.controls = 'controls'
  video.dataset.name = '光污染'
  const source = document.createElement('source')
  source.type = 'video/mp4'
  source.src = gwr // gwr 的值是启动服务下的绝对路径，例如：http://127.0.0.1:8081/dist/js/../media/777c7be1.mp4
  video.append(source)
  document.body.append(video)
}

// 测试 js 热替换
if (module.hot) {
  module.hot.accept(['./js/count'], () => console.log('count 文件更新了'))
  module.hot.accept(['./js/sum'], () => console.log('sum 文件更新了'))
}

// 测试按需加载
setTimeout(() => {
  /**
   * 1、这个 import 语法是 webpack 提供的，eslint 默认不识别，需要安装 eslint-plugin-import 插件，并在 .eslintrc.js 中配置
   *  - 使用 ecmaVersion: 11 这个配置也可以解决 eslint 报错问题
   * 2、webpackChunkName: "mul"：这是 webpack 动态引入文件命名的方式（魔法注释命名），"mul" 将会作为 [name] 的值显示
   *  - 可以通过 output.chunkFilename 配置输出文件名的格式
   *  - 如果多个动态引入的 webpackChunkName 相同，那么这几个 module 都将会打包到这个 bundle 文件中
   *  - 实际使用中我觉得还是不要自定义命名的好，一方面是麻烦，二方面是防止命名重复，打包到了一个 bundle 文件中（除非是刻意打包到一个文件）
   */
  import(/* webpackChunkName: "mul" */ './js/mul').then((data) => {
    const mul = data.default
    console.log('动态加载-mul.js', mul(2, 3))
  })
  /**
   * 动态加载 css 文件同理，可以在 MiniCssExtractPlugin 插件中通过 chunkFilename 字段配置输出文件名的格式
   */
  import(/* webpackChunkName: "back" */ './css/back.css').then((data) => {
    console.log('动态加载-back.css', data)
  })
}, 2000)

// 测试第三方库代码分割
console.log(_.random(0, 5))

// 测试 core-js polyfill 按需引入
new Promise((resolve) => {
  setTimeout(() => resolve(null), 1000)
}).then(() => {
  console.log('Promise resolved!')
})
console.log([1,2,3,4,5].includes(5))
