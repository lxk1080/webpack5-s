/**
 * @desc 清空打包目录
 *  - 几个重要的点：
 *    - 注册啥钩子？还是 compiler.hooks.emit 这个钩子，在打包输出前清空打包目录，为啥？
 *      - 如果一开始就清空了，那万一打包过程报错，这时候打包目录里面啥也没有，体验不好
 *    - 获取打包目录的方法：compiler.options.output.path
 *    - 删除目录，使用 compiler.outputFileSystem，为啥不用 fs 模块？
 *      - 可能是使用 webpack 内置的更方便吧。。
 */
class CleanWebpackPlugin {
  constructor() {
    this.outputPath = ''
    this.fs = null
  }

  apply(compiler) {
    // 1、获取打包输出的目录
    const outputPath = this.outputPath = compiler.options.output.path
    const fs = this.fs = compiler.outputFileSystem

    // 是一个绝对路径哈
    console.log('outputPath ==>', outputPath)

    // 2、注册钩子：在打包输出之前清空打包目录
    compiler.hooks.emit.tap('CleanWebpackPlugin', (compilation) => {
      // 3、通过 fs 删除打包输出目录下的所有文件
      this.removeFiles(fs, outputPath)
      // fs.rmdirSync(outputPath, { recursive: true })
      // debugger
    })
  }

  removeFiles(fs, dirPath) {
    // 想要删除打包输出目录下所有资源，需要先将目录下的资源删除，才能删除这个目录（这里先不用 recursive 这个属性哈）
    // 1、读取当前目录下所有资源
    const files = fs.readdirSync(dirPath)
    // 2、如果文件夹是空的则直接删除
    if (!files.length) this.rmdirButPath(dirPath)
    // 3、遍历一个个删除
    files.forEach((file, index) => {
      // 3.1 遍历所有文件，判断是文件夹还是文件
      const filePath = `${dirPath}/${file}`
      if (fs.statSync(filePath).isFile()) {
        // 3.2 是文件，直接删除
        fs.unlinkSync(filePath)
      } else {
        // 3.3 是文件夹，就得删除下面所有文件，才能删除文件夹
        this.removeFiles(fs, filePath)
      }
      // 3.4 删完文件夹内最后一个文件，删除当前文件夹
      if (index === files.length - 1) {
        this.rmdirButPath(dirPath)
      }
    })
  }

  // 删除文件夹，但是不要删除打包根目录
  rmdirButPath(dirPath) {
    if (dirPath === this.outputPath) return
    this.fs.rmdirSync(dirPath)
  }
}

module.exports = CleanWebpackPlugin
