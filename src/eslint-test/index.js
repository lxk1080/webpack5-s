// eslint 配置了不能使用 var，所以下面这行应该编译不通过。但是配置 exclude 可以让 eslint 忽略这个文件
// 但是 idea 不知道这个事情，包括 webstorm、vscode 及其它吧，虽然不影响编译，但是看起来会标红
// 所以需要配置一个 .eslintignore 文件，写上 src/test，让 idea 知道一下这个文件是不检查的，这样就不会标红了
var num = 20;
export default num;
