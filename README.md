# Crunker

Simple way to merge, concatenate, play, export and download audio files with the Web Audio API.

- No dependencies
- Tiny 2kB gzipped
- Written in Typescript

[View online demos](https://jaggad.github.io/crunker/examples/)

# Installation

```sh
yarn add crunker
```

```sh
npm install crunker
```

# Example

```javascript
let crunker = new Crunker();

crunker
  .fetchAudio('/song.mp3', '/another-song.mp3')
  .then((buffers) => {
    // => [AudioBuffer, AudioBuffer]
    return crunker.mergeAudio(buffers);
  })
  .then((merged) => {
    // => AudioBuffer
    return crunker.export(merged, 'audio/mp3');
  })
  .then((output) => {
    // => {blob, element, url}
    crunker.download(output.blob);
    document.body.append(output.element);
    console.log(output.url);
  })
  .catch((error) => {
    // => Error Message
  });

crunker.notSupported(() => {
  // Handle no browser support
});
```

# Condensed Example

```javascript
let crunker = new Crunker();

crunker
  .fetchAudio('/voice.mp3', '/background.mp3')
  .then((buffers) => crunker.mergeAudio(buffers))
  .then((merged) => crunker.export(merged, 'audio/mp3'))
  .then((output) => crunker.download(output.blob))
  .catch((error) => {
    throw new Error(error);
  });
```

# Input file Example

```javascript
let crunker = new Crunker();

const onFileInputChange = async (target) => {
  const buffers = await crunker.fetchAudio(...target.files, '/voice.mp3', '/background.mp3');
};

<input onChange={onFileInputChange(this)} type="file" accept="audio/*" />;
```

## Other Examples

- [Beat Builder Machine](examples/client/beatBuilder.html)

# [Graphic Representation of Methods](https://github.com/jackedgson/crunker/issues/16)

## Merge

![merge](https://user-images.githubusercontent.com/12958674/88806278-968f0680-d186-11ea-9cb5-8ef2606ffcc7.png)

## Concat

![concat](https://user-images.githubusercontent.com/12958674/88806297-9d1d7e00-d186-11ea-8cd2-c64cb0324845.png)

# Methods

For more detailed API documentation, view the Typescript typings.

## new Crunker()

Create a new instance of Crunker.
You may optionally provide an object with a `sampleRate` key, but it will default to the same sample rate as the internal audio context, which is appropriate for your device.

## crunker.fetchAudio(songURL, anotherSongURL)

Fetch one or more audio files.\
**Returns:** an array of audio buffers in the order they were fetched.

## crunker.mergeAudio(arrayOfBuffers);

Merge two or more audio buffers.\
**Returns:** a single `AudioBuffer` object.

## crunker.concatAudio(arrayOfBuffers);

Concatenate two or more audio buffers in the order specified.\
**Returns:** a single `AudioBuffer` object.

## crunker.padAudio(buffer, padStart, seconds);

Pad the audio with silence, at the beginning, the end, or any specified points through the audio.\
**Returns:** a single `AudioBuffer` object.

## crunker.sliceAudio(buffer, start, end, fadeIn, fadeOut);

Slice the audio to the specified range, removing any content outside the range. Optionally add a fade-in at the start and a fade-out at the end to avoid audible clicks.

- **buffer:** The audio buffer to be trimmed.
- **start:** The starting second from where the audio should begin.
- **end:** The ending second where the audio should be trimmed.
- **fadeIn:** (Optional) Number of seconds for the fade-in effect at the beginning. Default is `0`.
- **fadeOut:** (Optional) Number of seconds for the fade-out effect at the end. Default is `0`.

**Returns:** a single `AudioBuffer` object.

## crunker.export(buffer, type);

Export an audio buffers with MIME type option.\
**Type:** e.g. `'audio/mp3', 'audio/wav', 'audio/ogg'`.
**IMPORTANT**: the MIME type does **not** change the actual file format. It will always be a `WAVE` file under the hood.\
**Returns:** an object containing the blob object, url, and an audio element object.

## crunker.download(blob, filename);

Automatically download an exported audio blob with optional filename.\
**Filename:** String **not** containing the .mp3, .wav, or .ogg file extension.\
**Returns:** the `HTMLAnchorElement` element used to simulate the automatic download.

## crunker.play(buffer);

Starts playing the exported audio buffer in the background.\
**Returns:** the `HTMLAudioElement`.

## crunker.notSupported(callback);

Execute custom code if Web Audio API is not supported by the users browser.\
**Returns:** The callback function.

# Properties

For more detailed API documentation, view the Typescript typings.

## crunker.context

Access the [AudioContext](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext) used internally by a given Crunker.\
**Returns:** [AudioContext](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext).

# License

MIT
