const fs = require('fs')
const path = require('path')
const { entry, output } = require('./webpack.config')
const { traverse, transformSync, parseSync } = require('@babel/core')

// The moduleId start from 0, which is the entry moduleId
let ID = 0

const result = resolveModules(entry)
// Write the result to ./dist/bundle.js
fs.writeFileSync(path.join(output.path, output.filename), result)
console.log(result)

// Recursively resolve module dependencies
function resolveModules(filePath) {
  const entryModule = createModule(filePath)
  const modules = [entryModule]
  for (const module of modules) {
    module.dependencies.forEach(dependency => {
      // TODO: Rescursively add child dependencies
      // 1. Find the filePath from the dependency e.g. ./alertBtn
      // 2. Create the module from filePath
      // 3. Add the mapping of { dependency: moduleId }
      // 4. push the module into modules array

    })
  }
  return modules
}

// resolve relativePath to fullPath, e.g. ./message.js => src/message.js
function resolveDependencyPath(module, dependency) {
  const dirname = path.dirname(module.filePath)
  return path.join(dirname, dependency)
}

// The helper function to stringify module into javascript object
//   0: {
//     factory: function(require, module, exports) { code... },
//     dependencyMap: { './message.js': 2 }
//   }
function stringifyModule(module) {
  return `${module.id}: {
    factory: function(require, module, exports) {
      ${module.code}
    },
    dependencyMap: ${JSON.stringify(module.dependencyMap)}
  }`
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
function createModule(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')

  // transform ES6 modules to commonJS that works in most browsers
  const { code } = transformSync(content, { presets: ['@babel/preset-env'] })

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
    // The <path>:<moduleId> map for the module, e.g. { './message.js': 2 }
    dependencyMap: {},
  }
}
