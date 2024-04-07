import hundred from './hundred'

export default function sum(...args) {
  return args.reduce((p, c) => p + c, 0) + hundred;
  // 用来测试 source-map 是否有效
  // return args.reduce((p, c) => p + c, 0)();
}
