const webpack = require('webpack');

module.exports = {
  context: __dirname + "/src",
  entry: "./crunker.js",
  output: {
    path: __dirname + "/dist",
    filename: "crunker.js",
    library: "Crunker",
    libraryTarget: "umd",
    umdNamedDefine: true
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