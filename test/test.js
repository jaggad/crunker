import Crunker from 'crunker';

describe('Crunker', () => {
  const url = 'https://unpkg.com/crunker@1.3.0/examples/server/2.mp3';
  let audio, buffers;

  before(async () => {
    const testCrunk = new Crunker();
    buffers = await testCrunk.fetchAudio(url, url); // avoid redownload
  });

  beforeEach(() => {
    audio = new Crunker();
  });

  afterEach(() => {
    audio.close();
  });

  it('creates a context', () => {
    expect(audio._context).to.not.equal(null);
  });

  it('returns internal context', () => {
    expect(audio.context).to.be.instanceOf(window.AudioContext);
  });

  it('fetches a single audio file', async () => {
    const buffer = await audio.fetchAudio(url);
    expect(buffer[0]).to.have.property('sampleRate', 44100);
  });

  it('fetches multiple audio files', async () => {
    const buffers = await audio.fetchAudio(url, url);
    buffers.map((buffer) => {
      expect(buffer).to.have.property('sampleRate', 44100);
    });
  });

  it('returns a single buffer when merging', () => {
    expect(audio.mergeAudio(buffers)).to.have.property('sampleRate', 44100);
  });

  it('returns a single buffer when concatenating', () => {
    expect(audio.concatAudio(buffers)).to.have.property('sampleRate', 44100);
  });

  it('uses correct length when concatenating', () => {
    expect(audio.concatAudio(buffers).duration.toFixed(2)).to.equal('16.30');
  });

  it('exports an object', () => {
    const output = audio.export(buffers[0]);
    expect(output).to.not.equal(null);
  });

  it('exports an object with blob', () => {
    expect(audio.export(buffers[0])).to.have.property('blob');
  });

  it('exports an object with audio element', () => {
    expect(audio.export(buffers[0])).to.have.property('element');
  });

  it('exports an object with url', () => {
    expect(audio.export(buffers[0])).to.have.property('url');
  });
});
