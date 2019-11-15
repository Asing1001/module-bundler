const fs = require('fs')
const config = require('./webpack.config')
const { traverse, parse, transformSync } = require('@babel/core')
const path = require('path')

function createAsset(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const dependencies = []
  // See https://astexplorer.net/ for more detail
  const ast = parse(content, { sourceType: 'module' })
  traverse(ast, {
    ImportDeclaration: (declaration) => {
      dependencies.push(declaration.node.source.value)
    }
  })
  const { code } = transformSync(content, { presets: ['@babel/env'] })

  return {
    filePath,
    dependencies,
    code
  }
}

function createGraph(filePath) {
  const graph = [createAsset(filePath)]
  for (const asset of graph) {
    const assetDir = path.dirname(asset.filePath)
    asset.mapping = {}
    asset.dependencies.forEach(relativePath => {
      const dependencyPath = path.join(assetDir, relativePath)
      const dependency = createAsset(dependencyPath)
      asset.mapping[relativePath] = dependencyPath
      graph.push(dependency)
    })
  }
  return graph
}

function bundle(filePath) {
  const graph = createGraph(filePath)
  let modules = ''
  graph.forEach(module => {
    modules += `${JSON.stringify(module.filePath)}: {
      fn: function(require, module, exports) {
        ${module.code}
      },
      mapping: ${JSON.stringify(module.mapping)}
    },`
  })

  return `(function(modules){
    function require(path){
      const {fn, mapping} = modules[path]
      const module = { exports: {} }
      function localRequire(relativePath) {
        return require(mapping[relativePath])
      }
      fn(localRequire, module, module.exports)
      return module.exports
    }

    require(${JSON.stringify(filePath)})
  })({${modules}})`

}

const bundleJS = bundle(config.entry)
console.log(bundleJS)
const outputFileName = path.join(config.output.path, config.output.filename)
fs.writeFileSync(outputFileName, bundleJS)
