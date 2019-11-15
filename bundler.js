const fs = require('fs')
const config = require('./webpack.config')
const { traverse, parse } = require('@babel/core')
const path = require('path')

let ID = 0
function createAsset(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const asset = {
    id: ID++,
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

function createGraph(filePath) {
  const graph = [createAsset(filePath)]
  for (const asset of graph) {
    const assetDir = path.dirname(asset.filePath)
    asset.dependencies.forEach(dependency => {
      const dependencyPath = path.join(assetDir, dependency)
      graph.push(createAsset(dependencyPath))
    })
  }
  return graph
}



console.log(createGraph(config.entry))
