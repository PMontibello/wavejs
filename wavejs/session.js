
const FileController = require('./FileController');
const { PassThrough } = require('node:stream');

const streamStorage = {
  outputStreams: new Map(),
  supportedOutputFormats: ['dash', 'hls'],
  publisherStreams: new Map(), //3908f0_LIVE, <PassThrough ff ff ff>
  publishers: new Map(), // /LIVE/MY_COOL_STREAM, 3908f0_LIVE

  /* Publisher Stream Methods */
  initializePublisherStream(streamId) {
    this.publisherStreams.set(streamId, {
      res: new PassThrough(),
      numPlayCache: 0,
    });
  },
  retrievePublisherStream(streamId) {
    return this.publisherStreams.get(streamId);
  },
  /* output Stream Methods */
  initOutputStream(streamId) {
    this.outputStreams.set(streamId, {
      _fileController: new FileController(streamId),
      streams: {
        hls: {
          filePath: null,
          active: false, 
        },
        dash: {
          filePath: null,
          active: false,
        }
      }
    })
  },
  addOutputStream(streamId, protocol, active = true) {
    // Main error checking on protocol, active
    if (!this.supportedOutputFormats.includes(protocol)) throw new Error(`Stream Storage: protocol of '${protocol}' not included in accepted formats: ${this.supportedOutputFormats.join(', ')}}`);
    if (typeof active !== 'boolean') throw new Error(`Stream Storage: active needs to be boolean, not type ${typeof active}`)
    //main switch statement
    switch(protocol) {
      case 'dash': {
        const state = this.outputStreams.get(streamId);
        state.streams.dash.address = state._fileController.buildMPDDirPath();
        state.streams.dash.active = active;
        this.outputStreams.set(streamId, state);
        break;
      }
      case 'hls': {
        const state = this.outputStreams.get(streamId);
        state.streams.hls.address = state._fileController.buildHLSDirPath();
        state.streams.hls.active = active;
        this.outputStreams.set(streamId, state);
        break;
      }
      default:
        throw new Error(`StreamStorage: protocol of ${protocol} not accepted.`);
    }
  },
  getOutputStreamPath(streamId, protocol) {
    if (!this.supportedOutputFormats.includes(protocol)) throw new Error(`Stream Storage: protocol of '${protocol}' not included in accepted formats: ${this.supportedOutputFormats.join(', ')}}`);
    const state = this.outputStreams.get(streamId);
    switch(protocol) {
      case "dash": {
        return state.streams.dash.filePath;
      }
      case 'hls': {
        return state.streams.hls.filePath
      }
      default:
        throw new Error(`StreamStorage: protocol of ${protocol} not accepted.`);
    }
  },
  setOutputStreamActive(streamId, protocol, active = true) {
    if (!this.supportedOutputFormats.includes(protocol)) throw new Error(`Stream Storage: protocol of '${protocol}' not included in accepted formats: ${this.supportedOutputFormats.join(', ')}}`);
    const state = this.outputStreams.get(streamId);
    switch (protocol) {
      case "dash": {
        if (state.streams.dash.active === active) return;
        else {
          state.streams.dash.active = active;
          this.outputStreams.set(streamId, state);
          return;
        }
      }
      case 'hls': {
        if (state.streams.hls.active === active) return;
        else {
          state.streams.hls.active = active;
          this.outputStreams.set(streamId, state);
          return;
        }
      }
      default:
        throw new Error(`StreamStorage: protocol of ${protocol} not accepted.`);
    }
  }
};

module.exports = streamStorage;
