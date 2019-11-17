const fs = require('fs')
const path = require('path')
const { entry, output } = require('./webpack.config')
const { traverse, transformSync, parseSync } = require('@babel/core')


let ID = 0

const createModule = (filePath) => {
  const id = ID++
  const dependencyMap = {}
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
    id,
    filePath,
    code,
    dependencies,
    dependencyMap,
    toString: () => `${id}: {
      factory: (require, module, exports) => {
        ${code}
      },
      dependencyMap: ${JSON.stringify(dependencyMap)}
    }`
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

const packing = (filePath) => {
  const graph = createGraph(filePath)
  const modules = graph.map(module => module.toString()).join(',')
  return modules
}

const result = packing(entry)

console.log(result)