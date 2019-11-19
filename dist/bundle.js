(function(modules){
    function require(id) {
      const { factory, dependencyMap } = modules[id]
      const module = { exports: {} }
      function localRequire(relativePath) {
        const moduleId = dependencyMap[relativePath]
        return require(moduleId)
      }
      factory(localRequire, module, module.exports)
      return module.exports
    }
    require(0)
  })({0: {
    factory: function(require, module, exports) {
      "use strict";

var _alertBtn = _interopRequireDefault(require("./alertBtn.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var app = document.querySelector('.app');
app.appendChild(_alertBtn["default"]);
    },
    dependencyMap: {"./alertBtn.js":1}
  },1: {
    factory: function(require, module, exports) {
      "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _message = require("./message.js");

var alertBtn = document.createElement('button');
alertBtn.textContent = 'Click Me to Alert!';
alertBtn.addEventListener('click', function () {
  return alert(_message.message);
});
var _default = alertBtn;
exports["default"] = _default;
    },
    dependencyMap: {"./message.js":2}
  },2: {
    factory: function(require, module, exports) {
      "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.message = void 0;
var message = 'hello dev day';
exports.message = message;
    },
    dependencyMap: {}
  }})