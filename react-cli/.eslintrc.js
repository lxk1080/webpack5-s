module.exports = {
  extends: ["react-app"], // 继承 react 官方规则（需安装 eslint-config-react-app 包）
  parserOptions: {
    babelOptions: {
      presets: [
        // 解决页面报错问题
        ["babel-preset-react-app", false],
        "babel-preset-react-app/prod",
      ],
    },
  },
};
