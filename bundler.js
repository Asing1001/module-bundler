const fs = require('fs')
const config = require('./webpack.config')
const parser = require('@babel/parser')


function createAsset(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')

  // See https://astexplorer.net/ for more detail
  const ast = parser.parse(content, { sourceType: 'module' })

  return ast
}

console.log(createAsset(config.entry))
