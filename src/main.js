import count from './js/count';
import sum from './js/sum';
import './css/iconfont.css';
import './css/index.css';
import './less/index.less';
import './sass/index.sass';
import './sass/index.scss';
import './styl/index.styl';
import gwr from './media/lightPollution.mp4';
import num from './eslint-test';

console.log(count(2, 1));
console.log(sum(1, 2, 3, 4));

// 测试 eslint
console.log(num);

// 测试视频资源的处理
createVideo();

function createVideo() {
  const video = document.createElement('video');
  video.width = 400;
  video.autoplay = 'autoplay';
  // 谷歌浏览器和火狐浏览器现在都不支持非静音自动播放
  // 必须加上 muted 属性，否则 autoplay 无效，无法自动播放
  video.muted = 'muted';
  video.controls = 'controls';
  video.dataset.name = '光污染';
  const source = document.createElement('source');
  source.type = 'video/mp4';
  source.src = gwr; // gwr 的值是启动服务下的绝对路径，例如：http://127.0.0.1:8081/dist/js/../media/777c7be1.mp4
  video.append(source);
  document.body.append(video);
}

// 测试 js 热替换
if (module.hot) {
  module.hot.accept(['./js/count'], () => console.log('count 文件更新了'));
  module.hot.accept(['./js/sum'], () => console.log('sum 文件更新了'));
}

// 测试按需加载
setTimeout(() => {
  /**
   * 1、这个 import 语法是 webpack 提供的，eslint 默认不识别，需要安装 eslint-plugin-import 插件，并在 .eslintrc.js 中配置
   *  - 使用 ecmaVersion: 11 这个配置也可以解决 eslint 报错问题
   * 2、webpackChunkName: "mul"：这是 webpack 动态引入文件命名的方式（魔法注释命名），"mul" 将会作为 [name] 的值显示
   *  - 可以通过 output.chunkFilename 配置输出文件名的格式
   */
  import(/* webpackChunkName: "mul" */ './js/mul').then((mul) => {
    console.log('动态加载-mul.js', mul(2, 3))
  })
  /**
   * 动态加载 css 文件同理，可以在 MiniCssExtractPlugin 插件中通过 chunkFilename 字段配置输出文件名的格式
   */
  import(/* webpackChunkName: "back" */ './css/back.css').then((data) => {
    console.log('动态加载-back.css', data)
  })
}, 2000)
