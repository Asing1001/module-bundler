const fs = require('fs')
const config = require('./webpack.config')
const { traverse, parse } = require('@babel/core')

function createAsset(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const asset = {
    filePath,
    dependencies: []
  }

  // See https://astexplorer.net/ for more detail
  const ast = parse(content, { sourceType: 'module' })
  traverse(ast, {
    ImportDeclaration: (declaration) => {
      asset.dependencies.push(declaration.node.source.value)
    }
  })

  return asset
}

console.log(createAsset(config.entry))
