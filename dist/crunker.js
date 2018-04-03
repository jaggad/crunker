'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Crunker = function () {
	function Crunker() {
		_classCallCheck(this, Crunker);

		this._context = this._createContext();
	}

	_createClass(Crunker, [{
		key: '_createContext',
		value: function _createContext() {
			window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
			return new AudioContext();
		}
	}, {
		key: 'fetchAudio',
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
		key: 'mergeAudio',
		value: function mergeAudio(buffers) {
			var output = this._context.createBuffer(1, 44100 * this._maxDuration(buffers), 44100);

			buffers.map(function (buffer) {
				for (var i = buffer.getChannelData(0).length - 1; i >= 0; i--) {
					output.getChannelData(0)[i] += buffer.getChannelData(0)[i];
				}
			});
			return output;
		}
	}, {
		key: 'concatAudio',
		value: function concatAudio(buffers) {
			var output = this._context.createBuffer(1, 44100 * this._totalDuration(buffers), 44100),
			    offset = 0;
			buffers.map(function (buffer) {
				output.getChannelData(0).set(buffer.getChannelData(0), offset);
				offset += buffer.length;
			});
			return output;
		}
	}, {
		key: 'play',
		value: function play(buffer) {
			var source = this._context.createBufferSource();
			source.buffer = buffer;
			source.connect(this._context.destination);
			source.start();
			return source;
		}
	}, {
		key: 'export',
		value: function _export(buffer, audioType) {
			var type = audioType || 'audio/mp3';
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
		key: 'download',
		value: function download(blob, filename) {
			var name = filename || 'crunker';
			var a = document.createElement("a");
			a.style = "display: none";
			a.href = this._renderURL(blob);
			a.download = name + '.' + blob.type.split('/')[1];
			a.click();
			return a;
		}
	}, {
		key: 'notSupported',
		value: function notSupported(callback) {
			return !this._isSupported() && callback();
		}
	}, {
		key: 'close',
		value: function close() {
			this._context.close();
			return this;
		}
	}, {
		key: '_maxDuration',
		value: function _maxDuration(buffers) {
			return Math.max.apply(Math, buffers.map(function (buffer) {
				return buffer.duration;
			}));
		}
	}, {
		key: '_totalDuration',
		value: function _totalDuration(buffers) {
			return buffers.map(function (buffer) {
				return buffer.duration;
			}).reduce(function (a, b) {
				return a + b;
			}, 0);
		}
	}, {
		key: '_isSupported',
		value: function _isSupported() {
			return 'AudioContext' in window;
		}
	}, {
		key: '_writeHeaders',
		value: function _writeHeaders(buffer) {
			var arrayBuffer = new ArrayBuffer(44 + buffer.length * 2),
			    view = new DataView(arrayBuffer);

			this._writeString(view, 0, 'RIFF');
			view.setUint32(4, 32 + buffer.length * 2, true);
			this._writeString(view, 8, 'WAVE');
			this._writeString(view, 12, 'fmt ');
			view.setUint32(16, 16, true);
			view.setUint16(20, 1, true);
			view.setUint16(22, 2, true);
			view.setUint32(24, 44100, true);
			view.setUint32(28, 44100 * 4, true);
			view.setUint16(32, 4, true);
			view.setUint16(34, 16, true);
			this._writeString(view, 36, 'data');
			view.setUint32(40, buffer.length * 2, true);

			return this._floatTo16BitPCM(view, buffer, 44);
		}
	}, {
		key: '_floatTo16BitPCM',
		value: function _floatTo16BitPCM(dataview, buffer, offset) {
			for (var i = 0; i < buffer.length; i++, offset += 2) {
				var tmp = Math.max(-1, Math.min(1, buffer[i]));
				dataview.setInt16(offset, tmp < 0 ? tmp * 0x8000 : tmp * 0x7FFF, true);
			}
			return dataview;
		}
	}, {
		key: '_writeString',
		value: function _writeString(dataview, offset, header) {
			var output = void 0;
			for (var i = 0; i < header.length; i++) {
				dataview.setUint8(offset + i, header.charCodeAt(i));
			}
		}
	}, {
		key: '_interleave',
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
		key: '_renderAudioElement',
		value: function _renderAudioElement(blob, type) {
			var audio = document.createElement('audio');
			audio.controls = 'controls';
			audio.type = type;
			audio.src = this._renderURL(blob);
			return audio;
		}
	}, {
		key: '_renderURL',
		value: function _renderURL(blob) {
			return (window.URL || window.webkitURL).createObjectURL(blob);
		}
	}]);

	return Crunker;
}();
