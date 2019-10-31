const fs = require('fs')

function createBundle(entry) {
  const content = fs.readFileSync(entry, 'utf-8')
  console.log(content);
}

createBundle('./src/entry.js')