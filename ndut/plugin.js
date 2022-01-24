const server = require('../lib/server')

const plugin = async function (scope, options) {
  const config = await scope.ndut.helper.getConfig()
  if (options.mode === 'client') {
    scope.log.error(`Mode '${options.mode}' not implemented yet`)
    return
  }
  await server.call(scope, config, options)
}

module.exports = async function () {
  const { fp } = this.ndut.helper
  return fp(plugin)
}
