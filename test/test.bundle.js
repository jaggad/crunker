/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./test/test.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/crunker.js":
/*!************************!*\
  !*** ./src/crunker.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Crunker = function () {
  function Crunker() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$sampleRate = _ref.sampleRate,
        sampleRate = _ref$sampleRate === undefined ? 44100 : _ref$sampleRate;

    _classCallCheck(this, Crunker);

    this._sampleRate = sampleRate;
    this._context = this._createContext();
  }

  _createClass(Crunker, [{
    key: "_createContext",
    value: function _createContext() {
      window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
      return new AudioContext();
    }
  }, {
    key: "fetchAudio",
    value: async function fetchAudio() {
      var _this = this;

      for (var _len = arguments.length, filepaths = Array(_len), _key = 0; _key < _len; _key++) {
        filepaths[_key] = arguments[_key];
      }

      var files = filepaths.map(async function (filepath) {
        var buffer = await fetch(filepath).then(function (response) {
          return response.arrayBuffer();
        });
        return await _this._context.decodeAudioData(buffer);
      });
      return await Promise.all(files);
    }
  }, {
    key: "mergeAudio",
    value: function mergeAudio(buffers) {
      var output = this._context.createBuffer(1, this._sampleRate * this._maxDuration(buffers), this._sampleRate);

      buffers.map(function (buffer) {
        for (var i = buffer.getChannelData(0).length - 1; i >= 0; i--) {
          output.getChannelData(0)[i] += buffer.getChannelData(0)[i];
        }
      });
      return output;
    }
  }, {
    key: "concatAudio",
    value: function concatAudio(buffers) {
      var output = this._context.createBuffer(1, this._totalLength(buffers), this._sampleRate),
          offset = 0;
      buffers.map(function (buffer) {
        output.getChannelData(0).set(buffer.getChannelData(0), offset);
        offset += buffer.length;
      });
      return output;
    }
  }, {
    key: "play",
    value: function play(buffer) {
      var source = this._context.createBufferSource();
      source.buffer = buffer;
      source.connect(this._context.destination);
      source.start();
      return source;
    }
  }, {
    key: "export",
    value: function _export(buffer, audioType) {
      var type = audioType || "audio/mp3";
      var recorded = this._interleave(buffer);
      var dataview = this._writeHeaders(recorded);
      var audioBlob = new Blob([dataview], { type: type });

      return {
        blob: audioBlob,
        url: this._renderURL(audioBlob),
        element: this._renderAudioElement(audioBlob, type)
      };
    }
  }, {
    key: "download",
    value: function download(blob, filename) {
      var name = filename || "crunker";
      var a = document.createElement("a");
      a.style = "display: none";
      a.href = this._renderURL(blob);
      a.download = name + "." + blob.type.split("/")[1];
      a.click();
      return a;
    }
  }, {
    key: "notSupported",
    value: function notSupported(callback) {
      return !this._isSupported() && callback();
    }
  }, {
    key: "close",
    value: function close() {
      this._context.close();
      return this;
    }
  }, {
    key: "_maxDuration",
    value: function _maxDuration(buffers) {
      return Math.max.apply(Math, buffers.map(function (buffer) {
        return buffer.duration;
      }));
    }
  }, {
    key: "_totalLength",
    value: function _totalLength(buffers) {
      return buffers.map(function (buffer) {
        return buffer.length;
      }).reduce(function (a, b) {
        return a + b;
      }, 0);
    }
  }, {
    key: "_isSupported",
    value: function _isSupported() {
      return "AudioContext" in window;
    }
  }, {
    key: "_writeHeaders",
    value: function _writeHeaders(buffer) {
      var arrayBuffer = new ArrayBuffer(44 + buffer.length * 2),
          view = new DataView(arrayBuffer);

      this._writeString(view, 0, "RIFF");
      view.setUint32(4, 32 + buffer.length * 2, true);
      this._writeString(view, 8, "WAVE");
      this._writeString(view, 12, "fmt ");
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 2, true);
      view.setUint32(24, this._sampleRate, true);
      view.setUint32(28, this._sampleRate * 4, true);
      view.setUint16(32, 4, true);
      view.setUint16(34, 16, true);
      this._writeString(view, 36, "data");
      view.setUint32(40, buffer.length * 2, true);

      return this._floatTo16BitPCM(view, buffer, 44);
    }
  }, {
    key: "_floatTo16BitPCM",
    value: function _floatTo16BitPCM(dataview, buffer, offset) {
      for (var i = 0; i < buffer.length; i++, offset += 2) {
        var tmp = Math.max(-1, Math.min(1, buffer[i]));
        dataview.setInt16(offset, tmp < 0 ? tmp * 0x8000 : tmp * 0x7fff, true);
      }
      return dataview;
    }
  }, {
    key: "_writeString",
    value: function _writeString(dataview, offset, header) {
      var output = void 0;
      for (var i = 0; i < header.length; i++) {
        dataview.setUint8(offset + i, header.charCodeAt(i));
      }
    }
  }, {
    key: "_interleave",
    value: function _interleave(input) {
      var buffer = input.getChannelData(0),
          length = buffer.length * 2,
          result = new Float32Array(length),
          index = 0,
          inputIndex = 0;

      while (index < length) {
        result[index++] = buffer[inputIndex];
        result[index++] = buffer[inputIndex];
        inputIndex++;
      }
      return result;
    }
  }, {
    key: "_renderAudioElement",
    value: function _renderAudioElement(blob, type) {
      var audio = document.createElement("audio");
      audio.controls = "controls";
      audio.type = type;
      audio.src = this._renderURL(blob);
      return audio;
    }
  }, {
    key: "_renderURL",
    value: function _renderURL(blob) {
      return (window.URL || window.webkitURL).createObjectURL(blob);
    }
  }]);

  return Crunker;
}();

exports.default = Crunker;

/***/ }),

/***/ "./test/test.js":
/*!**********************!*\
  !*** ./test/test.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _crunker = __webpack_require__(/*! crunker */ "./src/crunker.js");

var _crunker2 = _interopRequireDefault(_crunker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe("Crunker", function () {
  var url = "https://www.freesound.org/data/previews/131/131660_2398403-lq.mp3";
  var audio = void 0,
      buffers = void 0;

  before(async function () {
    var testCrunk = new _crunker2.default();
    buffers = await testCrunk.fetchAudio(url, url); // avoid redownload
  });

  beforeEach(function () {
    audio = new _crunker2.default();
  });

  afterEach(function () {
    audio.close();
  });

  it("creates a context", function () {
    expect(audio._context).to.not.equal(null);
  });

  it("fetches a single audio file", async function () {
    var buffer = await audio.fetchAudio(url);
    expect(buffer[0]).to.have.property("sampleRate", 44100);
  });

  it("fetches multiple audio files", async function () {
    var buffers = await audio.fetchAudio(url, url);
    buffers.map(function (buffer) {
      expect(buffer).to.have.property("sampleRate", 44100);
    });
  });

  it("returns a single buffer when merging", function () {
    expect(audio.mergeAudio(buffers)).to.have.property("sampleRate", 44100);
  });

  it("returns a single buffer when concatenating", function () {
    expect(audio.concatAudio(buffers)).to.have.property("sampleRate", 44100);
  });

  it("uses correct length when concatenating", function () {
    var combinedDuration = buffers.reduce(function (prev, curr) {
      return prev.duration + curr.duration;
    });
    expect(audio.concatAudio(buffers)).to.have.property("duration", combinedDuration);
  });

  it("exports an object", function () {
    var output = audio.export(buffers[0]);
    expect(output).to.not.equal(null);
  });

  it("exports an object with blob", function () {
    expect(audio.export(buffers[0])).to.have.property("blob");
  });

  it("exports an object with audio element", function () {
    expect(audio.export(buffers[0])).to.have.property("element");
  });

  it("exports an object with url", function () {
    expect(audio.export(buffers[0])).to.have.property("url");
  });
});

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NydW5rZXIuanMiLCJ3ZWJwYWNrOi8vLy4vdGVzdC90ZXN0LmpzIl0sIm5hbWVzIjpbIkNydW5rZXIiLCJzYW1wbGVSYXRlIiwiX3NhbXBsZVJhdGUiLCJfY29udGV4dCIsIl9jcmVhdGVDb250ZXh0Iiwid2luZG93IiwiQXVkaW9Db250ZXh0Iiwid2Via2l0QXVkaW9Db250ZXh0IiwibW96QXVkaW9Db250ZXh0IiwiZmlsZXBhdGhzIiwiZmlsZXMiLCJtYXAiLCJmaWxlcGF0aCIsImJ1ZmZlciIsImZldGNoIiwidGhlbiIsInJlc3BvbnNlIiwiYXJyYXlCdWZmZXIiLCJkZWNvZGVBdWRpb0RhdGEiLCJQcm9taXNlIiwiYWxsIiwiYnVmZmVycyIsIm91dHB1dCIsImNyZWF0ZUJ1ZmZlciIsIl9tYXhEdXJhdGlvbiIsImkiLCJnZXRDaGFubmVsRGF0YSIsImxlbmd0aCIsIl90b3RhbExlbmd0aCIsIm9mZnNldCIsInNldCIsInNvdXJjZSIsImNyZWF0ZUJ1ZmZlclNvdXJjZSIsImNvbm5lY3QiLCJkZXN0aW5hdGlvbiIsInN0YXJ0IiwiYXVkaW9UeXBlIiwidHlwZSIsInJlY29yZGVkIiwiX2ludGVybGVhdmUiLCJkYXRhdmlldyIsIl93cml0ZUhlYWRlcnMiLCJhdWRpb0Jsb2IiLCJCbG9iIiwiYmxvYiIsInVybCIsIl9yZW5kZXJVUkwiLCJlbGVtZW50IiwiX3JlbmRlckF1ZGlvRWxlbWVudCIsImZpbGVuYW1lIiwibmFtZSIsImEiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJzdHlsZSIsImhyZWYiLCJkb3dubG9hZCIsInNwbGl0IiwiY2xpY2siLCJjYWxsYmFjayIsIl9pc1N1cHBvcnRlZCIsImNsb3NlIiwiTWF0aCIsIm1heCIsImFwcGx5IiwiZHVyYXRpb24iLCJyZWR1Y2UiLCJiIiwiQXJyYXlCdWZmZXIiLCJ2aWV3IiwiRGF0YVZpZXciLCJfd3JpdGVTdHJpbmciLCJzZXRVaW50MzIiLCJzZXRVaW50MTYiLCJfZmxvYXRUbzE2Qml0UENNIiwidG1wIiwibWluIiwic2V0SW50MTYiLCJoZWFkZXIiLCJzZXRVaW50OCIsImNoYXJDb2RlQXQiLCJpbnB1dCIsInJlc3VsdCIsIkZsb2F0MzJBcnJheSIsImluZGV4IiwiaW5wdXRJbmRleCIsImF1ZGlvIiwiY29udHJvbHMiLCJzcmMiLCJVUkwiLCJ3ZWJraXRVUkwiLCJjcmVhdGVPYmplY3RVUkwiLCJkZXNjcmliZSIsImJlZm9yZSIsInRlc3RDcnVuayIsImZldGNoQXVkaW8iLCJiZWZvcmVFYWNoIiwiYWZ0ZXJFYWNoIiwiaXQiLCJleHBlY3QiLCJ0byIsIm5vdCIsImVxdWFsIiwiaGF2ZSIsInByb3BlcnR5IiwibWVyZ2VBdWRpbyIsImNvbmNhdEF1ZGlvIiwiY29tYmluZWREdXJhdGlvbiIsInByZXYiLCJjdXJyIiwiZXhwb3J0Il0sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxrREFBMEMsZ0NBQWdDO0FBQzFFO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsZ0VBQXdELGtCQUFrQjtBQUMxRTtBQUNBLHlEQUFpRCxjQUFjO0FBQy9EOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpREFBeUMsaUNBQWlDO0FBQzFFLHdIQUFnSCxtQkFBbUIsRUFBRTtBQUNySTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOzs7QUFHQTtBQUNB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LEtBQUcsbUJBQUgsRUFBd0IsWUFBTTtBQUM1QixRQUFNNUUsU0FBU2dFLE1BQU13QixNQUFOLENBQWF6RixRQUFRLENBQVIsQ0FBYixDQUFmO0FBQ0E4RSxXQUFPN0UsTUFBUCxFQUFlOEUsRUFBZixDQUFrQkMsR0FBbEIsQ0FBc0JDLEtBQXRCLENBQTRCLElBQTVCO0FBQ0QsR0FIRDs7QUFLQUosS0FBRyw2QkFBSCxFQUFrQyxZQUFNO0FBQ3RDQyxXQUFPYixNQUFNd0IsTUFBTixDQUFhekYsUUFBUSxDQUFSLENBQWIsQ0FBUCxFQUFpQytFLEVBQWpDLENBQW9DRyxJQUFwQyxDQUF5Q0MsUUFBekMsQ0FBa0QsTUFBbEQ7QUFDRCxHQUZEOztBQUlBTixLQUFHLHNDQUFILEVBQTJDLFlBQU07QUFDL0NDLFdBQU9iLE1BQU13QixNQUFOLENBQWF6RixRQUFRLENBQVIsQ0FBYixDQUFQLEVBQWlDK0UsRUFBakMsQ0FBb0NHLElBQXBDLENBQXlDQyxRQUF6QyxDQUFrRCxTQUFsRDtBQUNELEdBRkQ7O0FBSUFOLEtBQUcsNEJBQUgsRUFBaUMsWUFBTTtBQUNyQ0MsV0FBT2IsTUFBTXdCLE1BQU4sQ0FBYXpGLFFBQVEsQ0FBUixDQUFiLENBQVAsRUFBaUMrRSxFQUFqQyxDQUFvQ0csSUFBcEMsQ0FBeUNDLFFBQXpDLENBQWtELEtBQWxEO0FBQ0QsR0FGRDtBQUdELENBcEVELEUiLCJmaWxlIjoidGVzdC5idW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3Rlc3QvdGVzdC5qc1wiKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDcnVua2VyIHtcbiAgY29uc3RydWN0b3IoeyBzYW1wbGVSYXRlID0gNDQxMDAgfSA9IHt9KSB7XG4gICAgdGhpcy5fc2FtcGxlUmF0ZSA9IHNhbXBsZVJhdGU7XG4gICAgdGhpcy5fY29udGV4dCA9IHRoaXMuX2NyZWF0ZUNvbnRleHQoKTtcbiAgfVxuXG4gIF9jcmVhdGVDb250ZXh0KCkge1xuICAgIHdpbmRvdy5BdWRpb0NvbnRleHQgPVxuICAgICAgd2luZG93LkF1ZGlvQ29udGV4dCB8fFxuICAgICAgd2luZG93LndlYmtpdEF1ZGlvQ29udGV4dCB8fFxuICAgICAgd2luZG93Lm1vekF1ZGlvQ29udGV4dDtcbiAgICByZXR1cm4gbmV3IEF1ZGlvQ29udGV4dCgpO1xuICB9XG5cbiAgYXN5bmMgZmV0Y2hBdWRpbyguLi5maWxlcGF0aHMpIHtcbiAgICBjb25zdCBmaWxlcyA9IGZpbGVwYXRocy5tYXAoYXN5bmMgZmlsZXBhdGggPT4ge1xuICAgICAgY29uc3QgYnVmZmVyID0gYXdhaXQgZmV0Y2goZmlsZXBhdGgpLnRoZW4ocmVzcG9uc2UgPT5cbiAgICAgICAgcmVzcG9uc2UuYXJyYXlCdWZmZXIoKVxuICAgICAgKTtcbiAgICAgIHJldHVybiBhd2FpdCB0aGlzLl9jb250ZXh0LmRlY29kZUF1ZGlvRGF0YShidWZmZXIpO1xuICAgIH0pO1xuICAgIHJldHVybiBhd2FpdCBQcm9taXNlLmFsbChmaWxlcyk7XG4gIH1cblxuICBtZXJnZUF1ZGlvKGJ1ZmZlcnMpIHtcbiAgICBsZXQgb3V0cHV0ID0gdGhpcy5fY29udGV4dC5jcmVhdGVCdWZmZXIoXG4gICAgICAxLFxuICAgICAgdGhpcy5fc2FtcGxlUmF0ZSAqIHRoaXMuX21heER1cmF0aW9uKGJ1ZmZlcnMpLFxuICAgICAgdGhpcy5fc2FtcGxlUmF0ZVxuICAgICk7XG5cbiAgICBidWZmZXJzLm1hcChidWZmZXIgPT4ge1xuICAgICAgZm9yIChsZXQgaSA9IGJ1ZmZlci5nZXRDaGFubmVsRGF0YSgwKS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBvdXRwdXQuZ2V0Q2hhbm5lbERhdGEoMClbaV0gKz0gYnVmZmVyLmdldENoYW5uZWxEYXRhKDApW2ldO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBvdXRwdXQ7XG4gIH1cblxuICBjb25jYXRBdWRpbyhidWZmZXJzKSB7XG4gICAgbGV0IG91dHB1dCA9IHRoaXMuX2NvbnRleHQuY3JlYXRlQnVmZmVyKFxuICAgICAgICAxLFxuICAgICAgICB0aGlzLl90b3RhbExlbmd0aChidWZmZXJzKSxcbiAgICAgICAgdGhpcy5fc2FtcGxlUmF0ZVxuICAgICAgKSxcbiAgICAgIG9mZnNldCA9IDA7XG4gICAgYnVmZmVycy5tYXAoYnVmZmVyID0+IHtcbiAgICAgIG91dHB1dC5nZXRDaGFubmVsRGF0YSgwKS5zZXQoYnVmZmVyLmdldENoYW5uZWxEYXRhKDApLCBvZmZzZXQpO1xuICAgICAgb2Zmc2V0ICs9IGJ1ZmZlci5sZW5ndGg7XG4gICAgfSk7XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfVxuXG4gIHBsYXkoYnVmZmVyKSB7XG4gICAgY29uc3Qgc291cmNlID0gdGhpcy5fY29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcbiAgICBzb3VyY2UuYnVmZmVyID0gYnVmZmVyO1xuICAgIHNvdXJjZS5jb25uZWN0KHRoaXMuX2NvbnRleHQuZGVzdGluYXRpb24pO1xuICAgIHNvdXJjZS5zdGFydCgpO1xuICAgIHJldHVybiBzb3VyY2U7XG4gIH1cblxuICBleHBvcnQoYnVmZmVyLCBhdWRpb1R5cGUpIHtcbiAgICBjb25zdCB0eXBlID0gYXVkaW9UeXBlIHx8IFwiYXVkaW8vbXAzXCI7XG4gICAgY29uc3QgcmVjb3JkZWQgPSB0aGlzLl9pbnRlcmxlYXZlKGJ1ZmZlcik7XG4gICAgY29uc3QgZGF0YXZpZXcgPSB0aGlzLl93cml0ZUhlYWRlcnMocmVjb3JkZWQpO1xuICAgIGNvbnN0IGF1ZGlvQmxvYiA9IG5ldyBCbG9iKFtkYXRhdmlld10sIHsgdHlwZTogdHlwZSB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICBibG9iOiBhdWRpb0Jsb2IsXG4gICAgICB1cmw6IHRoaXMuX3JlbmRlclVSTChhdWRpb0Jsb2IpLFxuICAgICAgZWxlbWVudDogdGhpcy5fcmVuZGVyQXVkaW9FbGVtZW50KGF1ZGlvQmxvYiwgdHlwZSlcbiAgICB9O1xuICB9XG5cbiAgZG93bmxvYWQoYmxvYiwgZmlsZW5hbWUpIHtcbiAgICBjb25zdCBuYW1lID0gZmlsZW5hbWUgfHwgXCJjcnVua2VyXCI7XG4gICAgY29uc3QgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xuICAgIGEuc3R5bGUgPSBcImRpc3BsYXk6IG5vbmVcIjtcbiAgICBhLmhyZWYgPSB0aGlzLl9yZW5kZXJVUkwoYmxvYik7XG4gICAgYS5kb3dubG9hZCA9IGAke25hbWV9LiR7YmxvYi50eXBlLnNwbGl0KFwiL1wiKVsxXX1gO1xuICAgIGEuY2xpY2soKTtcbiAgICByZXR1cm4gYTtcbiAgfVxuXG4gIG5vdFN1cHBvcnRlZChjYWxsYmFjaykge1xuICAgIHJldHVybiAhdGhpcy5faXNTdXBwb3J0ZWQoKSAmJiBjYWxsYmFjaygpO1xuICB9XG5cbiAgY2xvc2UoKSB7XG4gICAgdGhpcy5fY29udGV4dC5jbG9zZSgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgX21heER1cmF0aW9uKGJ1ZmZlcnMpIHtcbiAgICByZXR1cm4gTWF0aC5tYXguYXBwbHkoTWF0aCwgYnVmZmVycy5tYXAoYnVmZmVyID0+IGJ1ZmZlci5kdXJhdGlvbikpO1xuICB9XG5cbiAgX3RvdGFsTGVuZ3RoKGJ1ZmZlcnMpIHtcbiAgICByZXR1cm4gYnVmZmVycy5tYXAoYnVmZmVyID0+IGJ1ZmZlci5sZW5ndGgpLnJlZHVjZSgoYSwgYikgPT4gYSArIGIsIDApO1xuICB9XG5cbiAgX2lzU3VwcG9ydGVkKCkge1xuICAgIHJldHVybiBcIkF1ZGlvQ29udGV4dFwiIGluIHdpbmRvdztcbiAgfVxuXG4gIF93cml0ZUhlYWRlcnMoYnVmZmVyKSB7XG4gICAgbGV0IGFycmF5QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKDQ0ICsgYnVmZmVyLmxlbmd0aCAqIDIpLFxuICAgICAgdmlldyA9IG5ldyBEYXRhVmlldyhhcnJheUJ1ZmZlcik7XG5cbiAgICB0aGlzLl93cml0ZVN0cmluZyh2aWV3LCAwLCBcIlJJRkZcIik7XG4gICAgdmlldy5zZXRVaW50MzIoNCwgMzIgKyBidWZmZXIubGVuZ3RoICogMiwgdHJ1ZSk7XG4gICAgdGhpcy5fd3JpdGVTdHJpbmcodmlldywgOCwgXCJXQVZFXCIpO1xuICAgIHRoaXMuX3dyaXRlU3RyaW5nKHZpZXcsIDEyLCBcImZtdCBcIik7XG4gICAgdmlldy5zZXRVaW50MzIoMTYsIDE2LCB0cnVlKTtcbiAgICB2aWV3LnNldFVpbnQxNigyMCwgMSwgdHJ1ZSk7XG4gICAgdmlldy5zZXRVaW50MTYoMjIsIDIsIHRydWUpO1xuICAgIHZpZXcuc2V0VWludDMyKDI0LCB0aGlzLl9zYW1wbGVSYXRlLCB0cnVlKTtcbiAgICB2aWV3LnNldFVpbnQzMigyOCwgdGhpcy5fc2FtcGxlUmF0ZSAqIDQsIHRydWUpO1xuICAgIHZpZXcuc2V0VWludDE2KDMyLCA0LCB0cnVlKTtcbiAgICB2aWV3LnNldFVpbnQxNigzNCwgMTYsIHRydWUpO1xuICAgIHRoaXMuX3dyaXRlU3RyaW5nKHZpZXcsIDM2LCBcImRhdGFcIik7XG4gICAgdmlldy5zZXRVaW50MzIoNDAsIGJ1ZmZlci5sZW5ndGggKiAyLCB0cnVlKTtcblxuICAgIHJldHVybiB0aGlzLl9mbG9hdFRvMTZCaXRQQ00odmlldywgYnVmZmVyLCA0NCk7XG4gIH1cblxuICBfZmxvYXRUbzE2Qml0UENNKGRhdGF2aWV3LCBidWZmZXIsIG9mZnNldCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYnVmZmVyLmxlbmd0aDsgaSsrLCBvZmZzZXQgKz0gMikge1xuICAgICAgbGV0IHRtcCA9IE1hdGgubWF4KC0xLCBNYXRoLm1pbigxLCBidWZmZXJbaV0pKTtcbiAgICAgIGRhdGF2aWV3LnNldEludDE2KG9mZnNldCwgdG1wIDwgMCA/IHRtcCAqIDB4ODAwMCA6IHRtcCAqIDB4N2ZmZiwgdHJ1ZSk7XG4gICAgfVxuICAgIHJldHVybiBkYXRhdmlldztcbiAgfVxuXG4gIF93cml0ZVN0cmluZyhkYXRhdmlldywgb2Zmc2V0LCBoZWFkZXIpIHtcbiAgICBsZXQgb3V0cHV0O1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaGVhZGVyLmxlbmd0aDsgaSsrKSB7XG4gICAgICBkYXRhdmlldy5zZXRVaW50OChvZmZzZXQgKyBpLCBoZWFkZXIuY2hhckNvZGVBdChpKSk7XG4gICAgfVxuICB9XG5cbiAgX2ludGVybGVhdmUoaW5wdXQpIHtcbiAgICBsZXQgYnVmZmVyID0gaW5wdXQuZ2V0Q2hhbm5lbERhdGEoMCksXG4gICAgICBsZW5ndGggPSBidWZmZXIubGVuZ3RoICogMixcbiAgICAgIHJlc3VsdCA9IG5ldyBGbG9hdDMyQXJyYXkobGVuZ3RoKSxcbiAgICAgIGluZGV4ID0gMCxcbiAgICAgIGlucHV0SW5kZXggPSAwO1xuXG4gICAgd2hpbGUgKGluZGV4IDwgbGVuZ3RoKSB7XG4gICAgICByZXN1bHRbaW5kZXgrK10gPSBidWZmZXJbaW5wdXRJbmRleF07XG4gICAgICByZXN1bHRbaW5kZXgrK10gPSBidWZmZXJbaW5wdXRJbmRleF07XG4gICAgICBpbnB1dEluZGV4Kys7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBfcmVuZGVyQXVkaW9FbGVtZW50KGJsb2IsIHR5cGUpIHtcbiAgICBjb25zdCBhdWRpbyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhdWRpb1wiKTtcbiAgICBhdWRpby5jb250cm9scyA9IFwiY29udHJvbHNcIjtcbiAgICBhdWRpby50eXBlID0gdHlwZTtcbiAgICBhdWRpby5zcmMgPSB0aGlzLl9yZW5kZXJVUkwoYmxvYik7XG4gICAgcmV0dXJuIGF1ZGlvO1xuICB9XG5cbiAgX3JlbmRlclVSTChibG9iKSB7XG4gICAgcmV0dXJuICh3aW5kb3cuVVJMIHx8IHdpbmRvdy53ZWJraXRVUkwpLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgfVxufVxuIiwiaW1wb3J0IENydW5rZXIgZnJvbSAnY3J1bmtlcic7XG5cbmRlc2NyaWJlKFwiQ3J1bmtlclwiLCAoKSA9PiB7XG4gIGNvbnN0IHVybCA9XG4gICAgXCJodHRwczovL3d3dy5mcmVlc291bmQub3JnL2RhdGEvcHJldmlld3MvMTMxLzEzMTY2MF8yMzk4NDAzLWxxLm1wM1wiO1xuICBsZXQgYXVkaW8sIGJ1ZmZlcnM7XG5cbiAgYmVmb3JlKGFzeW5jICgpID0+IHtcbiAgICBjb25zdCB0ZXN0Q3J1bmsgPSBuZXcgQ3J1bmtlcigpO1xuICAgIGJ1ZmZlcnMgPSBhd2FpdCB0ZXN0Q3J1bmsuZmV0Y2hBdWRpbyh1cmwsIHVybCk7IC8vIGF2b2lkIHJlZG93bmxvYWRcbiAgfSk7XG5cbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgYXVkaW8gPSBuZXcgQ3J1bmtlcigpO1xuICB9KTtcblxuICBhZnRlckVhY2goKCkgPT4ge1xuICAgIGF1ZGlvLmNsb3NlKCk7XG4gIH0pO1xuXG4gIGl0KFwiY3JlYXRlcyBhIGNvbnRleHRcIiwgKCkgPT4ge1xuICAgIGV4cGVjdChhdWRpby5fY29udGV4dCkudG8ubm90LmVxdWFsKG51bGwpO1xuICB9KTtcblxuICBpdChcImZldGNoZXMgYSBzaW5nbGUgYXVkaW8gZmlsZVwiLCBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgYnVmZmVyID0gYXdhaXQgYXVkaW8uZmV0Y2hBdWRpbyh1cmwpO1xuICAgIGV4cGVjdChidWZmZXJbMF0pLnRvLmhhdmUucHJvcGVydHkoXCJzYW1wbGVSYXRlXCIsIDQ0MTAwKTtcbiAgfSk7XG5cbiAgaXQoXCJmZXRjaGVzIG11bHRpcGxlIGF1ZGlvIGZpbGVzXCIsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBidWZmZXJzID0gYXdhaXQgYXVkaW8uZmV0Y2hBdWRpbyh1cmwsIHVybCk7XG4gICAgYnVmZmVycy5tYXAoYnVmZmVyID0+IHtcbiAgICAgIGV4cGVjdChidWZmZXIpLnRvLmhhdmUucHJvcGVydHkoXCJzYW1wbGVSYXRlXCIsIDQ0MTAwKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgaXQoXCJyZXR1cm5zIGEgc2luZ2xlIGJ1ZmZlciB3aGVuIG1lcmdpbmdcIiwgKCkgPT4ge1xuICAgIGV4cGVjdChhdWRpby5tZXJnZUF1ZGlvKGJ1ZmZlcnMpKS50by5oYXZlLnByb3BlcnR5KFwic2FtcGxlUmF0ZVwiLCA0NDEwMCk7XG4gIH0pO1xuXG4gIGl0KFwicmV0dXJucyBhIHNpbmdsZSBidWZmZXIgd2hlbiBjb25jYXRlbmF0aW5nXCIsICgpID0+IHtcbiAgICBleHBlY3QoYXVkaW8uY29uY2F0QXVkaW8oYnVmZmVycykpLnRvLmhhdmUucHJvcGVydHkoXCJzYW1wbGVSYXRlXCIsIDQ0MTAwKTtcbiAgfSk7XG5cbiAgaXQoXCJ1c2VzIGNvcnJlY3QgbGVuZ3RoIHdoZW4gY29uY2F0ZW5hdGluZ1wiLCAoKSA9PiB7XG4gICAgY29uc3QgY29tYmluZWREdXJhdGlvbiA9IGJ1ZmZlcnMucmVkdWNlKFxuICAgICAgKHByZXYsIGN1cnIpID0+IHByZXYuZHVyYXRpb24gKyBjdXJyLmR1cmF0aW9uXG4gICAgKTtcbiAgICBleHBlY3QoYXVkaW8uY29uY2F0QXVkaW8oYnVmZmVycykpLnRvLmhhdmUucHJvcGVydHkoXG4gICAgICBcImR1cmF0aW9uXCIsXG4gICAgICBjb21iaW5lZER1cmF0aW9uXG4gICAgKTtcbiAgfSk7XG5cbiAgaXQoXCJleHBvcnRzIGFuIG9iamVjdFwiLCAoKSA9PiB7XG4gICAgY29uc3Qgb3V0cHV0ID0gYXVkaW8uZXhwb3J0KGJ1ZmZlcnNbMF0pO1xuICAgIGV4cGVjdChvdXRwdXQpLnRvLm5vdC5lcXVhbChudWxsKTtcbiAgfSk7XG5cbiAgaXQoXCJleHBvcnRzIGFuIG9iamVjdCB3aXRoIGJsb2JcIiwgKCkgPT4ge1xuICAgIGV4cGVjdChhdWRpby5leHBvcnQoYnVmZmVyc1swXSkpLnRvLmhhdmUucHJvcGVydHkoXCJibG9iXCIpO1xuICB9KTtcblxuICBpdChcImV4cG9ydHMgYW4gb2JqZWN0IHdpdGggYXVkaW8gZWxlbWVudFwiLCAoKSA9PiB7XG4gICAgZXhwZWN0KGF1ZGlvLmV4cG9ydChidWZmZXJzWzBdKSkudG8uaGF2ZS5wcm9wZXJ0eShcImVsZW1lbnRcIik7XG4gIH0pO1xuXG4gIGl0KFwiZXhwb3J0cyBhbiBvYmplY3Qgd2l0aCB1cmxcIiwgKCkgPT4ge1xuICAgIGV4cGVjdChhdWRpby5leHBvcnQoYnVmZmVyc1swXSkpLnRvLmhhdmUucHJvcGVydHkoXCJ1cmxcIik7XG4gIH0pO1xufSk7XG4iXSwic291cmNlUm9vdCI6IiJ9