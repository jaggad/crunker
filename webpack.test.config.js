const path = require('path');
const webpack = require('webpack');

const testDir = `${__dirname}/test/`;

module.exports = {
  context: __dirname,
  entry: `${testDir}/test.js`,
  devtool: 'inline-source-map',
  output: {
    path: testDir,
    filename: 'test.bundle.js',
    library: 'Crunker',
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  resolve: {
    alias: {
      crunker: path.resolve(__dirname, 'src/crunker.ts'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(j|t)s$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: [
            [
              '@babel/preset-env',
              { exclude: ['@babel/plugin-transform-regenerator', '@babel/plugin-transform-async-to-generator'] },
            ],
            '@babel/preset-typescript',
          ],
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
  ],
};
