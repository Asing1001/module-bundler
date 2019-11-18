const path = require('path')

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: './src/entry.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  }
}