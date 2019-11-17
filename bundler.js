const fs = require('fs')
const path = require('path')
const { entry, output } = require('./webpack.config')
const { traverse, transformSync, parseSync } = require('@babel/core')


let ID = 0

const createModule = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8')
  const { code } = transformSync(content, { presets: ['@babel/env'] })
  const ast = parseSync(content, { sourceType: 'module' })
  const dependencies = []
  traverse(ast, {
    ImportDeclaration: (declare) => {
      dependencies.push(declare.node.source.value)
    }
  })

  return {
    id: ID++,
    filePath,
    code,
    dependencies,
    dependencyMap: {}
  }
}

const resolveDependencyPath = (module, dependency) => {
  const dirname = path.dirname(module.filePath)
  return path.join(dirname, dependency)
}

const createGraph = (filePath) => {
  const graph = [createModule(filePath)]
  for (const module of graph) {
    module.dependencies.forEach(dependency => {
      const dependencyPath = resolveDependencyPath(module, dependency)
      const childModule = createModule(dependencyPath)
      module.dependencyMap[dependency] = childModule.id
      graph.push(childModule)
    })
  }
  return graph
}

const result = createGraph(entry)

console.log(result)