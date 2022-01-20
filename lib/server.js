const bindBase = require('./server/bind-base')
const search = require('./server/search')
const tree = require('./server/tree')

module.exports = function (options) {
  const { _ } = this.ndut.helper
  const { ldap, trimKey } = this.ndutLdap.helper
  const server = ldap.createServer()

  let trees = []

  const getUser = (req, res, next) => {
    req.user = trimKey(req.connection.ldap.bindDN.toString())
    next()
  }

  const pre = [getUser]

  return new Promise((resolve, reject) => {
    this.ndutDb.model.SiteInfo.find({ where: { status: 'ENABLED' } })
      .then(sites => {
        _.each(sites, site => {
          const parts = site.hostname.split('.')
          const baseDn = _.map(parts, p => `dc=${p}`).join(',')
          trees = _.concat(trees, tree.call(this, baseDn))
          bindBase.call(this, { server, site, trees, baseDn })
          search.call(this, { server, site, pre, trees, baseDn, options })
        })
        server.listen(options.server.port, () => {
          this.log.info(`LDAP Server is running at: ${server.url}`)
        })
        resolve()
      })
  })
}