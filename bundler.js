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
      const dependencyPath = resolveDependencyPath(module, dependency)
      const childModule = createModule(dependencyPath)
      module.dependencyMap[dependency] = childModule.id
      modules.push(childModule)
    })
  }
  return modules
}

const packing = (filePath) => {
  const modules = resolveModules(filePath)
  const modulesString = modules.map(stringifyModule).join(',')

  return `(function(modules) {
    function require(id) {
      const { factory, dependencyMap } = modules[id]
      function localRequire (dependency) {
        return require(dependencyMap[dependency])
      }
      const module = { exports: {} }
      factory(localRequire, module, module.exports)
      return module.exports
    }
    require(0)
  })({ ${modulesString} })`
}

const result = packing(entry)
fs.writeFileSync(path.join(output.path, output.filename), result)

console.log(result)