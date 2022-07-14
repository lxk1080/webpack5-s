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
