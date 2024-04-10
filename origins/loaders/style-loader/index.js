/**
 * @desc 实现 style-loader 的功能
 *  - 主要是使用了 pitching loader 这一功能，使用 normal loader 难以操作（具体步骤，看以下解析）
 */

function styleLoader(content) {
  /*
    1. 直接使用 style-loader，只能处理样式，不能处理样式中引入的其他资源（例如：图片、@import 导入 css 语法）

      use: ["./loaders/style-loader"],

    2. 借助 css-loader 解决样式中引入的其他资源的问题

      use: ["./loaders/style-loader", "css-loader"],

      问题是 css-loader 暴露了一段 js 代码，style-loader 需要执行 js 代码，得到返回值，再动态创建 style 标签，插入到页面上

      执行 js 代码这块，不好操作！

    3. 参考 style-loader 使用的是 pitch loader 用法
  */

  // const script = `
  //   const styleEl = document.createElement('style');
  //   styleEl.innerHTML = ${JSON.stringify(content)};
  //   document.head.appendChild(styleEl);
  // `
  // return script
}

styleLoader.pitch = function (remainingRequest) {
  // remainingRequest 后面还需要处理的 loader
  console.log('remainingRequest ==>', remainingRequest);
  // D:\ZCODE\webpack5-s\origins\node_modules\css-loader\dist\cjs.js!D:\ZCODE\webpack5-s\origins\src\css\index.css
  // 这里是 inline loader 用法，代表后面还有一个 css-loader 等待处理

  // 1. 将 remainingRequest 中绝对路径改成相对路径（因为后面只能使用相对路径操作）
  //    - 为啥不用 path 模块处理成相对路径？这是因为后面的使用有要求：
  //      - 1、必须是相对路径
  //      - 2、相对路径必须以 ./ 或 ../ 开头
  //      - 3、相对路径的路径分隔符必须是 / ，不能是 \
  const relativePath = remainingRequest
    .split("!")
    .map((absolutePath) => {
      // 返回相对路径
      // 第一个参数：绝对路径要相对的路径，这里的 this.context 是 css 文件所在的绝对路径
      // 第二个参数：要转换成相对路径的绝对路径
      return this.utils.contextify(this.context, absolutePath);
    })
    .join("!")

  console.log('relativePath ==>', relativePath);
  // ../../node_modules/css-loader/dist/cjs.js!./index.css

  // 2. 引入 css-loader 处理后的资源
  // 3. 创建 style，将内容插入页面中生效
  /*
    relativePath 是 inline loader 用法，代表要处理的 index.css 资源，使用 css-loader 处理，
    !! 代表禁用所有配置的 loader，只使用 inline loader，
    也就是 webpack.config.js 中我们定义的 style-loader 和 css-loader，它们被禁用了，
    只使用我们指定的 inline loader，也就是 css-loader
  */
  const script = `
    import style from "!!${relativePath}";
    const styleEl = document.createElement('style');
    styleEl.innerHTML = style;
    document.head.appendChild(styleEl);
  `

  // pitch 函数中存在 return，代表中止后面 loader 执行，熔断 loader 链
  // 这里 style-loader 是第一个 loader，由于 return 导致熔断，所以其他 loader 不执行了（不管是 normal 还是 pitch）
  return script
}

module.exports = styleLoader
