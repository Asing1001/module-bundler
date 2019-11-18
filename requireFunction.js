function require(id) {
  const { factory, dependencyMap } = modules[id]
  const module = { exports: {} }
  function localRequire(dependency) {
    const moduleId = dependencyMap[dependency]
    return require(moduleId)
  }
  factory(localRequire, module, module.exports)
  return module.exports
}