const fs = require('fs')
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
  }
}

const result = createModule(entry)

console.log(result)