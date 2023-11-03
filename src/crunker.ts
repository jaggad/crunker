export interface CrunkerConstructorOptions {
  /**
   * Sample rate for Crunker's internal audio context.
   *
   * @default 44100
   */
  sampleRate: number;
}

export type CrunkerInputTypes = string | File | Blob;

/**
 * An exported Crunker audio object.
 */
export interface ExportedCrunkerAudio {
  blob: Blob;
  url: string;
  element: HTMLAudioElement;
}

/**
 * Crunker is the simple way to merge, concatenate, play, export and download audio files using the Web Audio API.
 */
export default class Crunker {
  private readonly _sampleRate: number;
  private readonly _context: AudioContext;

  /**
   * Creates a new instance of Crunker with the provided options.
   *
   * If `sampleRate` is not defined, it will auto-select an appropriate sample rate
   * for the device being used.
   */
  constructor({ sampleRate }: Partial<CrunkerConstructorOptions> = {}) {
    this._context = this._createContext(sampleRate);

    sampleRate ||= this._context.sampleRate;

    this._sampleRate = sampleRate;
  }

  /**
   * Creates Crunker's internal AudioContext.
   *
   * @internal
   */
  private _createContext(sampleRate: number = 44_100): AudioContext {
    window.AudioContext = window.AudioContext || (window as any).webkitAudioContext || (window as any).mozAudioContext;
    return new AudioContext({sampleRate});
  }

  /**
   *
   * The internal AudioContext used by Crunker.
   */
  get context(): AudioContext {
    return this._context;
  }

  /**
   * Asynchronously fetches multiple audio files and returns an array of AudioBuffers.
   */
  async fetchAudio(...filepaths: CrunkerInputTypes[]): Promise<AudioBuffer[]> {
    return await Promise.all(
      filepaths.map(async (filepath) => {
        let buffer: ArrayBuffer;

        if (filepath instanceof File || filepath instanceof Blob) {
          buffer = await filepath.arrayBuffer();
        } else {
          buffer = await fetch(filepath).then((response) => {
            if (response.headers.has('Content-Type') && !response.headers.get('Content-Type')!.includes('audio/')) {
              console.warn(
                `Crunker: Attempted to fetch an audio file, but its MIME type is \`${
                  response.headers.get('Content-Type')!.split(';')[0]
                }\`. We'll try and continue anyway. (file: "${filepath}")`
              );
            }

            return response.arrayBuffer();
          });
        }

        return await this._context.decodeAudioData(buffer);
      })
    );
  }

  /**
   * Merges (layers) multiple AudioBuffers into a single AudioBuffer.
   *
   * **Visual representation:**
   *
   * ![](https://user-images.githubusercontent.com/12958674/88806278-968f0680-d186-11ea-9cb5-8ef2606ffcc7.png)
   */
  mergeAudio(buffers: AudioBuffer[]): AudioBuffer {
    const output = this._context.createBuffer(
      this._maxNumberOfChannels(buffers),
      this._sampleRate * this._maxDuration(buffers),
      this._sampleRate
    );

    buffers.forEach((buffer) => {
      for (let channelNumber = 0; channelNumber < buffer.numberOfChannels; channelNumber++) {
        const outputData = output.getChannelData(channelNumber);
        const bufferData = buffer.getChannelData(channelNumber);

        for (let i = buffer.getChannelData(channelNumber).length - 1; i >= 0; i--) {
          outputData[i] += bufferData[i];
        }

        output.getChannelData(channelNumber).set(outputData);
      }
    });

    return output;
  }

  /**
   * Concatenates multiple AudioBuffers into a single AudioBuffer.
   *
   * **Visual representation:**
   *
   * ![](https://user-images.githubusercontent.com/12958674/88806297-9d1d7e00-d186-11ea-8cd2-c64cb0324845.png)
   */
  concatAudio(buffers: AudioBuffer[]): AudioBuffer {
    const output = this._context.createBuffer(
      this._maxNumberOfChannels(buffers),
      this._totalLength(buffers),
      this._sampleRate
    );
    let offset = 0;

    buffers.forEach((buffer) => {
      for (let channelNumber = 0; channelNumber < buffer.numberOfChannels; channelNumber++) {
        output.getChannelData(channelNumber).set(buffer.getChannelData(channelNumber), offset);
      }

      offset += buffer.length;
    });

    return output;
  }

  /**
   * Pads a specified AudioBuffer with silence from a specified start time,
   * for a specified length of time.
   *
   * Accepts float values as well as whole integers.
   *
   * @param buffer AudioBuffer to pad
   * @param padStart Time to start padding (in seconds)
   * @param seconds Duration to pad for (in seconds)
   */
  padAudio(buffer: AudioBuffer, padStart: number = 0, seconds: number = 0): AudioBuffer {
    if (seconds === 0) return buffer;

    if (padStart < 0) throw new Error('Crunker: Parameter "padStart" in padAudio must be positive');
    if (seconds < 0) throw new Error('Crunker: Parameter "seconds" in padAudio must be positive');

    const updatedBuffer = this._context.createBuffer(
      buffer.numberOfChannels,
      Math.ceil(buffer.length + seconds * buffer.sampleRate),
      buffer.sampleRate
    );

    for (let channelNumber = 0; channelNumber < buffer.numberOfChannels; channelNumber++) {
      const channelData = buffer.getChannelData(channelNumber);
      updatedBuffer
        .getChannelData(channelNumber)
        .set(channelData.subarray(0, Math.ceil(padStart * buffer.sampleRate) + 1), 0);

      updatedBuffer
        .getChannelData(channelNumber)
        .set(
          channelData.subarray(Math.ceil(padStart * buffer.sampleRate) + 2, updatedBuffer.length + 1),
          Math.ceil((padStart + seconds) * buffer.sampleRate)
        );
    }

    return updatedBuffer;
  }

  /**
   * Slices an AudioBuffer from the specified start time to the end time, with optional fade in and out.
   *
   * @param buffer AudioBuffer to slice
   * @param start Start time (in seconds)
   * @param end End time (in seconds)
   * @param fadeIn Fade in duration (in seconds, default is 0)
   * @param fadeOut Fade out duration (in seconds, default is 0)
   */
  sliceAudio(buffer: AudioBuffer, start: number, end: number, fadeIn: number = 0, fadeOut: number = 0): AudioBuffer {
    if (start >= end) throw new Error('Crunker: "start" time should be less than "end" time in sliceAudio method');

    const length = Math.round((end - start) * this._sampleRate);
    const offset = Math.round(start * this._sampleRate);
    const newBuffer = this._context.createBuffer(buffer.numberOfChannels, length, this._sampleRate);

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const inputData = buffer.getChannelData(channel);
      const outputData = newBuffer.getChannelData(channel);

      for (let i = 0; i < length; i++) {
        outputData[i] = inputData[offset + i];

        // Apply fade in
        if (i < fadeIn * this._sampleRate) {
          outputData[i] *= i / (fadeIn * this._sampleRate);
        }

        // Apply fade out
        if (i > length - fadeOut * this._sampleRate) {
          outputData[i] *= (length - i) / (fadeOut * this._sampleRate);
        }
      }
    }

    return newBuffer;
  }

  /**
   * Plays the provided AudioBuffer in an AudioBufferSourceNode.
   */
  play(buffer: AudioBuffer): AudioBufferSourceNode {
    const source = this._context.createBufferSource();

    source.buffer = buffer;
    source.connect(this._context.destination);
    source.start();

    return source;
  }

  /**
   * Exports the specified AudioBuffer to a Blob, Object URI and HTMLAudioElement.
   *
   * Note that changing the MIME type does not change the actual file format. The
   * file format will **always** be a WAVE file due to how audio is stored in the
   * browser.
   *
   * @param buffer Buffer to export
   * @param type MIME type (default: `audio/wav`)
   */
  export(buffer: AudioBuffer, type: string = 'audio/wav'): ExportedCrunkerAudio {
    const recorded = this._interleave(buffer);
    const dataview = this._writeHeaders(recorded, buffer.numberOfChannels, buffer.sampleRate);
    const audioBlob = new Blob([dataview], { type });

    return {
      blob: audioBlob,
      url: this._renderURL(audioBlob),
      element: this._renderAudioElement(audioBlob),
    };
  }

  /**
   * Downloads the provided Blob.
   *
   * @param blob Blob to download
   * @param filename An optional file name to use for the download (default: `crunker`)
   */
  download(blob: Blob, filename: string = 'crunker'): HTMLAnchorElement {
    const a = document.createElement('a');

    a.style.display = 'none';
    a.href = this._renderURL(blob);
    a.download = `${filename}.${blob.type.split('/')[1]}`;
    a.click();

    return a;
  }

  /**
   * Executes a callback if the browser does not support the Web Audio API.
   *
   * Returns the result of the callback, or `undefined` if the Web Audio API is supported.
   *
   * @param callback callback to run if the browser does not support the Web Audio API
   */
  notSupported<T>(callback: () => T): T | undefined {
    return this._isSupported() ? undefined : callback();
  }

  /**
   * Closes Crunker's internal AudioContext.
   */
  close(): this {
    this._context.close();
    return this;
  }

  /**
   * Returns the largest duration of the longest AudioBuffer.
   *
   * @internal
   */
  private _maxDuration(buffers: AudioBuffer[]): number {
    return Math.max(...buffers.map((buffer) => buffer.duration));
  }

  /**
   * Returns the largest number of channels in an array of AudioBuffers.
   *
   * @internal
   */
  private _maxNumberOfChannels(buffers: AudioBuffer[]): number {
    return Math.max(...buffers.map((buffer) => buffer.numberOfChannels));
  }

  /**
   * Returns the sum of the lengths of an array of AudioBuffers.
   *
   * @internal
   */
  private _totalLength(buffers: AudioBuffer[]): number {
    return buffers.map((buffer) => buffer.length).reduce((a, b) => a + b, 0);
  }

  /**
   * Returns whether the browser supports the Web Audio API.
   *
   * @internal
   */
  private _isSupported(): boolean {
    return 'AudioContext' in window || 'webkitAudioContext' in window || 'mozAudioContext' in window;
  }

  /**
   * Writes the WAV headers for the specified Float32Array.
   *
   * Returns a DataView containing the WAV headers and file content.
   *
   * @internal
   */
  private _writeHeaders(buffer: Float32Array, numOfChannels: number, sampleRate: number): DataView {
    const bitDepth = 16;
    const bytesPerSample = bitDepth / 8;
    const sampleSize = numOfChannels * bytesPerSample;

    const fileHeaderSize = 8;
    const chunkHeaderSize = 36;
    const chunkDataSize = buffer.length * bytesPerSample;
    const chunkTotalSize = chunkHeaderSize + chunkDataSize;

    const arrayBuffer = new ArrayBuffer(fileHeaderSize + chunkTotalSize);
    const view = new DataView(arrayBuffer);

    this._writeString(view, 0, 'RIFF');
    view.setUint32(4, chunkTotalSize, true);
    this._writeString(view, 8, 'WAVE');
    this._writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * sampleSize, true);
    view.setUint16(32, sampleSize, true);
    view.setUint16(34, bitDepth, true);
    this._writeString(view, 36, 'data');
    view.setUint32(40, chunkDataSize, true);

    return this._floatTo16BitPCM(view, buffer, fileHeaderSize + chunkHeaderSize);
  }

  /**
   * Converts a Float32Array to 16-bit PCM.
   *
   * @internal
   */
  private _floatTo16BitPCM(dataview: DataView, buffer: Float32Array, offset: number): DataView {
    for (let i = 0; i < buffer.length; i++, offset += 2) {
      const tmp = Math.max(-1, Math.min(1, buffer[i]));
      dataview.setInt16(offset, tmp < 0 ? tmp * 0x8000 : tmp * 0x7fff, true);
    }

    return dataview;
  }

  /**
   * Writes a string to a DataView at the specified offset.
   *
   * @internal
   */
  private _writeString(dataview: DataView, offset: number, header: string): void {
    for (let i = 0; i < header.length; i++) {
      dataview.setUint8(offset + i, header.charCodeAt(i));
    }
  }

  /**
   * Converts an AudioBuffer to a Float32Array.
   *
   * @internal
   */
  private _interleave(input: AudioBuffer): Float32Array {
    const channels = Array.from({ length: input.numberOfChannels }, (_, i) => i);
    const length = channels.reduce((prev, channelIdx) => prev + input.getChannelData(channelIdx).length, 0);
    const result = new Float32Array(length);

    let index = 0;
    let inputIndex = 0;

    // for 2 channels its like: [L[0], R[0], L[1], R[1], ... , L[n], R[n]]
    while (index < length) {
      channels.forEach((channelIdx) => {
        result[index++] = input.getChannelData(channelIdx)[inputIndex];
      });

      inputIndex++;
    }

    return result;
  }

  /**
   * Creates an HTMLAudioElement whose source is the specified Blob.
   *
   * @internal
   */
  private _renderAudioElement(blob: Blob): HTMLAudioElement {
    const audio = document.createElement('audio');

    audio.controls = true;
    audio.src = this._renderURL(blob);

    return audio;
  }

  /**
   * Creates an Object URL for the specified Blob.
   *
   * @internal
   */
  private _renderURL(blob: Blob): string {
    return (window.URL || window.webkitURL).createObjectURL(blob);
  }
}
