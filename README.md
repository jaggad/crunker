# Crunker

**Experimental, use in production with caution**

Simple way to merge, concatenate, play, export and download audio files with the Web Audio API.

- No dependencies
- Tiny 1.8kB gzipped

# Example

```javascript
let audio = new Crunker();

audio
  .fetchAudio("/song.mp3", "/another-song.mp3")
  .then(buffers => {
    // => [AudioBuffer, AudioBuffer]
    audio.mergeAudio(buffers);
  })
  .then(merged => {
    // => AudioBuffer
    audio.export(merged, "audio/mp3");
  })
  .then(output => {
    // => {blob, element, url}
    audio.download(output.blob);
    document.append(output.element);
    console.log(output.url);
  })
  .catch(error => {
    // => Error Message
  });

audio.notSupported(() => {
  // Handle no browser support
});
```

# Condensed Example

```javascript
let audio = new Crunker();

audio
  .fetchAudio("/voice.mp3", "/background.mp3")
  .then(buffers => audio.mergeAudio(buffers))
  .then(merged => audio.export(merged, "audio/mp3"))
  .then(output => audio.download(output.blob))
  .catch(error => {
    throw new Error(error);
  });
```

# Methods

## new Crunker({ sampleRate: 44100 })

Create a new Crunker.
You may optionally provide an object with a `sampleRate` key, defaults to 44100.

## crunker.fetchAudio(songURL, anotherSongURL)

Fetch one or more audio files.
Returns: an array of audio buffers in the order they were fetched.

## crunker.mergeAudio(arrayOfBuffers);

Merge two or more audio buffers.
Returns: a single AudioBuffer object.

## crunker.concatAudio(arrayOfBuffers);

Concatenate two or more audio buffers in the order specified.
Returns: a single AudioBuffer object.

## crunker.export(buffer, type);

Export an audio buffers with MIME type option.
Type: `'audio/mp3', 'audio/wav', 'audio/ogg'`.
Returns: an object containing the blob object, url, and an audio element object.

## crunker.download(blob, filename);

Automatically download an exported audio blob with optional filename.
Returns: the `<a></a>` element used to simulate the automatic download.

## crunker.download(blob, filename);

Automatically download an exported audio blob with optional filename.
Filename: String not containing the .mp3, .wav, or .ogg file extension.
Returns: the `<a></a>` element used to simulate the automatic download.

## crunker.play(blob);

Starts playing the exported audio blob in the background.
Returns: the audio source object.

## audio.notSupported(callback);

Execute custom code if Web Audio API is not supported by the users browser.
Returns: The callback function.

# License

MIT
