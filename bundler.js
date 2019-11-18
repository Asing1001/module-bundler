const fs = require('fs')
const path = require('path')
const { entry, output } = require('./webpack.config')
const { traverse, transformSync, parseSync } = require('@babel/core')

let ID = 0

const resolveModules = (filePath) => {
  const modules = [createModule(filePath)]
  for (const module of modules) {
    module.dependencies.forEach(dependency => {
      // TODO: Rescursively add child dependencies
    })
  }
  return modules
}

// resolve relativePath to fullPath, e.g. ./message.js => src/message.js
const resolveDependencyPath = (module, dependency) => {
  const dirname = path.dirname(module.filePath)
  return path.join(dirname, dependency)
}

// Create a module, e.g.
// {
//   id: 0,
//   filePath: 'src/entry.js',
//   code: 'commonjs codes',
//   dependencies: ['./message.js'],
//   dependencyMap: {
//     './message.js': 1
//   }
// }
const createModule = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8')
  // transform ES6 modules to commonJS that works in most browsers
  const { code } = transformSync(content, { presets: ['@babel/env'] })
  // Abstract syntax tree https://astexplorer.net/#/gist/1e826eba65c32d9bf34795ccfea83cf7/b3039a0f8ecaafb12d15951166cd7b762cd206de
  const dependencies = []
  const abstractSyntaxTree = parseSync(content, { sourceType: 'module' })
  traverse(abstractSyntaxTree, {
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

const result = resolveModules(entry)
fs.writeFileSync(path.join(output.path, output.filename), result)

console.log(result)