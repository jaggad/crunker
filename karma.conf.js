module.exports = function (config) {
  config.set({
    frameworks: ['mocha', 'chai'],
    files: ['test/test.bundle.js'],
    reporters: ['progress'],
    port: 9876, // karma web server port
    colors: true,
    browserDisconnectTimeout: 100000,
    logLevel: config.LOG_INFO,
    browsers: ['ChromeHeadless'],
    autoWatch: false,
    // singleRun: false, // Karma captures browsers, runs the tests and exits
    concurrency: Infinity,
    client: {
      mocha: {
        timeout: 10000, // 10 seconds - upped from 2 seconds
      },
    },
  });
};
