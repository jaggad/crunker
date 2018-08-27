const path = require('path');
const webpack = require('webpack');

const testDir = `${__dirname}/test/`;

module.exports = {
  context: __dirname,
  entry: `${testDir}/test.js`,
  devtool: 'inline-source-map',
  output: {
    path: testDir,
    filename: "test.bundle.js",
    library: "Crunker",
    libraryTarget: "umd",
    umdNamedDefine: true
  },
  resolve: {
      alias: {
          'crunker': path.resolve(__dirname, 'src/crunker.js')
      }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
  ]
};