/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./compiler/count.js":
/*!***************************!*\
  !*** ./compiler/count.js ***!
  \***************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ count; }
/* harmony export */ });
function count (a, b) {
  console.log(a + b)
}


/***/ }),

/***/ "./compiler/utils.js":
/*!***************************!*\
  !*** ./compiler/utils.js ***!
  \***************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "count": function() { return /* reexport safe */ _count__WEBPACK_IMPORTED_MODULE_0__["default"]; },
/* harmony export */   "printHello": function() { return /* binding */ printHello; }
/* harmony export */ });
/* harmony import */ var _count__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./count */ "./compiler/count.js");



const printHello = () => {
  console.log('hello')
}

const key = 'world'
/* harmony default export */ __webpack_exports__["default"] = (key);


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
!function() {
/*!***************************!*\
  !*** ./compiler/index.js ***!
  \***************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ "./compiler/utils.js");
/**
 * 使用 npm run compiler 打包
 *  - 命令：npx webpack --entry ./compiler/index.js -o ./compiler/bundle --mode=development --no-devtool
 *  - 开发模式下不会压缩代码，更容易阅读，另外，去掉了 source-map 相关的代码
 */



const createComponent = () => {
  const div = document.createElement('div')

  ;(0,_utils__WEBPACK_IMPORTED_MODULE_0__.printHello)()
  console.log(_utils__WEBPACK_IMPORTED_MODULE_0__["default"])
  ;(0,_utils__WEBPACK_IMPORTED_MODULE_0__.count)(1, 2)

  document.body.appendChild(div)
}

createComponent()
/* harmony default export */ __webpack_exports__["default"] = (createComponent);

}();
/******/ })()
;