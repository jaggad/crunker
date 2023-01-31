const config = require('./webpack.config.js');

config.experiments = {
  outputModule: true,
};

config.output = {
  path: __dirname + '/dist',
  filename: 'crunker.esm.js',
  module: true,
  library: {
    type: 'module',
  },
};

module.exports = config;
