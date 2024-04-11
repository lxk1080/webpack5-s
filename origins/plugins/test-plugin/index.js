/**
 * @desc 自定义一个插件
 *  - webpack 执行流程大致如下：
 *    - 1、webpack 加载 webpack.config.js 中所有配置，此时就会 new TestPlugin()，插件的 constructor 被执行
 *    - 2、webpack 创建 compiler 对象（后面 plugin 中的 apply 方法要用到）
 *    - 3、遍历 plugins 中所有的插件，调用插件的 apply 方法
 *    - 4、执行剩下编译流程（触发各个 hooks 事件，并执行挂载在上面的任务）
 *  - 在不同的 hooks 上挂载任务时，不需要关注定义顺序（写代码的顺序），hooks 事件会在相应的时机被触发
 *  - 在相同的 hooks 上挂载任务时：
 *    - 同步钩子：任务按定义顺序执行
 *    - 异步串行钩子：任务按定义顺序执行，下一个任务会等待上一个任务响应后执行
 *    - 异步并行钩子：任务 “同时” 执行（并行），谁先做完就先响应谁
 */
class TestPlugin {
  constructor() {
    this.name = 'TestPlugin'
    console.log('TestPlugin Constructor')
  }

  // 此时 compiler 对象已经生成
  apply(compiler) {
    // 可以使用 npm run debug 在 chrome 上调试代码
    // debugger
    // console.log('compiler', compiler)

    /**
     * 下面是：同步钩子 environment
     */

    // 由文档可知，environment 是同步钩子，所以需要使用 tap 注册
    // 第一个参数是：要注册的插件名。至于为啥要传这个。。谁知道呢。。
    // 第二个参数是：触发钩子时，要执行的方法
    // 如果回调函数有参数，文档会说明，如果没说，那就没有
    compiler.hooks.environment.tap(this.name, () => {
      console.log('TestPlugin environment 111')
    })

    compiler.hooks.environment.tap(this.name, () => {
      console.log('TestPlugin environment 222')
    })

    /**
     * 下面是：异步串行钩子 emit
     */

    // 由文档可知，emit 是异步串行钩子：AsyncSeriesHook
    compiler.hooks.emit.tap(this.name, (compilation) => {
      // debugger
      // console.log('compilation', compilation)
      console.log('TestPlugin emit 111')
    })

    // 使用 tapAsync 注册异步钩子时，会多出一个 callback 参数，用来异步调用
    compiler.hooks.emit.tapAsync(this.name, (compilation, callback) => {
      setTimeout(() => {
        console.log('TestPlugin emit 222')
        callback()
      }, 2000)
    })

    // 使用 tapPromise 注册异步钩子时，需要返回一个 Promise
    compiler.hooks.emit.tapPromise(this.name, (compilation) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('TestPlugin emit 333')
          resolve()
        }, 1000)
      })
    })

    /**
     * 下面是：异步并行钩子 make
     */

    // 由文档可知，make 是异步并行钩子：AsyncParallelHook
    compiler.hooks.make.tapAsync(this.name, (compilation, callback) => {
      // 由生命周期可知，compilation.hooks 需要在 compilation 阶段触发前注册才能使用
      // 最晚能生效的钩子就是 compiler.hooks.make
      compilation.hooks.seal.tap(this.name, () => {
        console.log('TestPlugin seal')
      })

      setTimeout(() => {
        console.log('TestPlugin make 333')
        callback()
      }, 3000)
    })

    compiler.hooks.make.tapAsync(this.name, (compilation, callback) => {
      setTimeout(() => {
        console.log('TestPlugin make 111')
        callback()
      }, 1000)
    })

    compiler.hooks.make.tapAsync(this.name, (compilation, callback) => {
      setTimeout(() => {
        console.log('TestPlugin make 222')
        callback()
      }, 2000)
    })
  }
}

module.exports = TestPlugin
