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
    // transpiled code, work in most browsers
    code,
    // Every import declaration ['./foo.js', './bar.js']
    dependencies,
    // The <path>:<moduleId> map for the module, e.g. { './message.js': 1 }
    dependencyMap: {},
  }
}

const stringifyModule = (module) => `${module.id}: {
  factory: (require, module, exports) => {
    ${module.code}
  },
  dependencyMap: ${JSON.stringify(module.dependencyMap)}
}`

const resolveDependencyPath = (module, dependency) => {
  const dirname = path.dirname(module.filePath)
  return path.join(dirname, dependency)
}

const resolveModules = (filePath) => {
  const modules = [createModule(filePath)]
  for (const module of modules) {
    module.dependencies.forEach(dependency => {
      // TODO: Rescursively add child dependencies
    })
  }
  return modules
}

const result = resolveModules(entry)
fs.writeFileSync(path.join(output.path, output.filename), result)

console.log(result)