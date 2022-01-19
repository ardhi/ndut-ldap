const server = require('../lib/server')

const plugin = async function (scope, options) {
  if (options.mode === 'client') {
    scope.log.error(`Mode '${options.mode}' not implemented yet`)
    return
  }
  await server.call(scope, options)
}

module.exports = async function () {
  const { fp } = this.ndut.helper
  return fp(plugin)
}
