"use strict";

export default class Crunker {
  constructor({ sampleRate = 44100 } = {}) {
    this._sampleRate = sampleRate;
    this._context = this._createContext();
  }

  _createContext() {
    window.AudioContext =
      window.AudioContext ||
      window.webkitAudioContext ||
      window.mozAudioContext;
    return new AudioContext();
  }

  async fetchAudio(...filepaths) {
    const files = filepaths.map(async (filepath) => {
      const buffer = await fetch(filepath).then((response) =>
        response.arrayBuffer()
      );
      return await this._context.decodeAudioData(buffer);
    });
    return await Promise.all(files);
  }

  mergeAudio(buffers) {
    const output = this._context.createBuffer(
      this._maxNumberOfChannels(buffers),
      this._sampleRate * this._maxDuration(buffers),
      this._sampleRate
    );

    buffers.forEach((buffer) => {
      for (
        let channelNumber = 0;
        channelNumber < buffer.numberOfChannels;
        channelNumber += 1
      ) {
        const outputData = output.getChannelData(channelNumber);
        const bufferData = buffer.getChannelData(channelNumber);

        for (
          let i = buffer.getChannelData(channelNumber).length - 1;
          i >= 0;
          i -= 1
        ) {
          outputData[i] += bufferData[i];
        }

        output.getChannelData(channelNumber).set(outputData);
      }
    });
    return output;
  }

  concatAudio(buffers) {
    const output = this._context.createBuffer(
      this._maxNumberOfChannels(buffers),
      this._totalLength(buffers),
      this._sampleRate
    );
    let offset = 0;

    buffers.forEach((buffer) => {
      for (
        let channelNumber = 0;
        channelNumber < buffer.numberOfChannels;
        channelNumber += 1
      ) {
        output
          .getChannelData(channelNumber)
          .set(buffer.getChannelData(channelNumber), offset);
      }

      offset += buffer.length;
    });
    return output;
  }

  padAudio(buffer, padStart = 0, seconds = 0) {
    if (seconds === 0) return buffer;
    if (padStart < 0)
      throw new Error(
        'Crunker: Parameter "padStart" in padAudio must be positive'
      );
    if (seconds < 0)
      throw new Error(
        'Crunker: Parameter "seconds" in padAudio must be positive'
      );

    const updatedBuffer = this._context.createBuffer(
      buffer.numberOfChannels,
      buffer.length + seconds * buffer.sampleRate,
      buffer.sampleRate
    );

    for (
      let channelNumber = 0;
      channelNumber < buffer.numberOfChannels;
      channelNumber += 1
    ) {
      const channelData = buffer.getChannelData(channelNumber);
      updatedBuffer
        .getChannelData(channelNumber)
        .set(channelData.subarray(0, padStart * buffer.sampleRate + 1), 0);

      updatedBuffer
        .getChannelData(channelNumber)
        .set(
          channelData.subarray(
            padStart * buffer.sampleRate + 2,
            updatedBuffer.length + 1
          ),
          (padStart + seconds) * buffer.sampleRate
        );
    }

    return updatedBuffer;
  }

  play(buffer) {
    const source = this._context.createBufferSource();
    source.buffer = buffer;
    source.connect(this._context.destination);
    source.start();
    return source;
  }

  export(buffer, audioType) {
    const type = audioType || "audio/mp3";
    const recorded = this._interleave(buffer);
    const dataview = this._writeHeaders(recorded);
    const audioBlob = new Blob([dataview], { type: type });

    return {
      blob: audioBlob,
      url: this._renderURL(audioBlob),
      element: this._renderAudioElement(audioBlob, type),
    };
  }

  download(blob, filename) {
    const name = filename || "crunker";
    const a = document.createElement("a");
    a.style = "display: none";
    a.href = this._renderURL(blob);
    a.download = `${name}.${blob.type.split("/")[1]}`;
    a.click();
    return a;
  }

  notSupported(callback) {
    return !this._isSupported() && callback();
  }

  close() {
    this._context.close();
    return this;
  }

  _maxDuration(buffers) {
    return Math.max.apply(
      Math,
      buffers.map((buffer) => buffer.duration)
    );
  }

  _maxNumberOfChannels(buffers) {
    return Math.max.apply(
      Math,
      buffers.map((buffer) => buffer.numberOfChannels)
    );
  }

  _totalLength(buffers) {
    return buffers.map((buffer) => buffer.length).reduce((a, b) => a + b, 0);
  }

  _isSupported() {
    return "AudioContext" in window;
  }

  _writeHeaders(buffer) {
    let arrayBuffer = new ArrayBuffer(44 + buffer.length * 2),
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

  _floatTo16BitPCM(dataview, buffer, offset) {
    for (var i = 0; i < buffer.length; i++, offset += 2) {
      let tmp = Math.max(-1, Math.min(1, buffer[i]));
      dataview.setInt16(offset, tmp < 0 ? tmp * 0x8000 : tmp * 0x7fff, true);
    }
    return dataview;
  }

  _writeString(dataview, offset, header) {
    let output;
    for (var i = 0; i < header.length; i++) {
      dataview.setUint8(offset + i, header.charCodeAt(i));
    }
  }

  _interleave(input) {
    let buffer = input.getChannelData(0),
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

  _renderAudioElement(blob, type) {
    const audio = document.createElement("audio");
    audio.controls = "controls";
    audio.type = type;
    audio.src = this._renderURL(blob);
    return audio;
  }

  _renderURL(blob) {
    return (window.URL || window.webkitURL).createObjectURL(blob);
  }
}
