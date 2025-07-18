// 首先最外面是一个 iife（立即执行函数），搞一块单独的作用域，可以防止变量全局污染
(function () {
  "use strict";
  // __webpack_modules__ 里面列举了除了入口文件外的所有模块
  //  - 其中 key 是模块文件的路径
  //  - 对应的 value 是一个函数，函数内包含这个文件模块的内容，并且已经准备好了要导出的内容（暂时还没导出）
  //  - 那什么时候会导出？
  //    - 在调用 __webpack_require__ 的时候会导出（其实就是把内容 return 出去）
  //    - 要导出的内容会挂到 __webpack_require__ 提供的 __webpack_exports__ 对象上（这个就是 __webpack_require__.d 做的事）
  //    - 最终由 __webpack_require__ return 出去内容
  var __webpack_modules__ = ({
    "./compiler/count.js": (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {
      __webpack_require__.r(__webpack_exports__);
      __webpack_require__.d(__webpack_exports__, {
        // 注意这个地方，其 value 是一个函数，返回一个函数，返回的函数才是我们需要的东西
        //  - 为什么不直接赋值成目标函数？（像这样："default": count）
        //    - 因为 __webpack_require__.d 会把这个外层函数作为 get 函数，所以我们调用属性的时候，外层函数会直接被执行，并返回我们需要的东西
        "default": function() { return count; }
      });
      function count (a, b) {
        console.log(a + b)
      }
    }),
    "./compiler/utils.js": (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
      __webpack_require__.r(__webpack_exports__);
      __webpack_require__.d(__webpack_exports__, {
        "count": function() { return _count__WEBPACK_IMPORTED_MODULE_0__["default"]; },
        "printHello": function () {
          return printHello;
        }
      });

      var _count__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./compiler/count.js");

      const printHello = () => {
        console.log('hello')
      }

      const key = 'world'
      __webpack_exports__["default"] = (key);
    })
  });

  // 模块只要加载过一次，就存入缓存
  var __webpack_module_cache__ = {};

  function __webpack_require__(moduleId) {
    var cachedModule = __webpack_module_cache__[moduleId];

    // 加载模块时，会先从缓存读取，如果缓存里面有，就直接返回模块的导出内容
    // 从这个地方我们可以看到，为什么一个模块内的代码只会执行一次，后续的引用只会走导出，原理就在这，在 CommonJS 里面，也是同样的实现
    // 所以不同的模块化规范对应的模块执行方式，不要看规范是啥，而要看实现这个模块化的是谁，是怎么实现的
    // 也许换个模块化实现工具它就不缓存了呢，当然这种可能性很小，因为不缓存的话，对于代码的执行是有问题的
    if (cachedModule !== undefined) {
      return cachedModule.exports;
    }

    // 缓存没有的话，就新建 Module，并存入模块缓存中
    var module = __webpack_module_cache__[moduleId] = {
      exports: {}
    };

    // __webpack_require__ 把容器（module.exports）给到模块，让模块往容器内放入自己的导出内容，放的时候需要用到的工具，也是 __webpack_require__ 提供的
    // 这就好比：__webpack_require__ 是村长，每个模块都是村里的住户（我只是觉得这个比喻挺形象的，所以写在这，下面的故事可以直接略过）
    //  有一天：张三需要村里某些住户的姓名，此时村长就给这些住户每人一张纸一支笔，让住户自己在纸上写上名字，写好了后，村长把这些纸张收集起来，给到张三
    //  上面的人物对应到代码就是：
    //    有一天：代码执行到这了
    //    张三：某个模块（也许是入口模块）
    //    村长：__webpack_require__
    //    纸张：module.exports
    //    笔：__webpack_require__.d
    //    住户：模块
    //    名字：模块导出的内容
    //    给张三：return module.exports
    // 哈哈，听不懂就直接看代码的执行吧，总之还是比较巧妙的，每个模块执行自身的挂载函数，将导出内容挂到 module.exports 中
    __webpack_modules__[moduleId](module, module.exports, __webpack_require__);

    return module.exports;
  }

  !function () {
    // 把模块导出的内容放到 __webpack_require__ 生成的 module.exports 上
    __webpack_require__.d = function (exports, definition) {
      for (var key in definition) {
        // 是自己的属性 && exports 上没有的
        if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
          // definition[key] 是一个函数，exports[key] = definition[key]()
          Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
        }
      }
    };
  }();

  !function () {
    // 判断是不是自己身上的属性，有可能是原型链上的
    __webpack_require__.o = function (obj, prop) {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    }
  }();

  !function () {
    // 这个方法主要是给 exports 添加一些属性标识
    __webpack_require__.r = function (exports) {
      if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
        // 这句话的作用是将 Object.prototype.toString.call(exports) 值变成 [object Module]，默认是 [object Object]
        Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
      }
      Object.defineProperty(exports, '__esModule', { value: true });
    };
  }();

  // 这个 exports 是入口文件的导出内容
  var __webpack_exports__ = {};

  // 这里面就是入口文件的代码，只不过都换成了 webpack 模块化的形式
  // 也是个 iife，程序就是从这里开始运行的
  !function () {
    __webpack_require__.r(__webpack_exports__);

    var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./compiler/utils.js");

    const createComponent = () => {
      const div = document.createElement('div')

      ;(0, _utils__WEBPACK_IMPORTED_MODULE_0__.printHello)()
      console.log('key ==>', _utils__WEBPACK_IMPORTED_MODULE_0__["default"])
      ;(0,_utils__WEBPACK_IMPORTED_MODULE_0__.count)(1, 2)

      document.body.appendChild(div)
    }

    createComponent()
  }();
})();
