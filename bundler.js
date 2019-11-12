const fs = require('fs')
const config = require('./webpack.config')

function createAsset(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  return content
}

console.log(createAsset(config.entry))
