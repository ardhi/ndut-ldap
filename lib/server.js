const bindBase = require('./server/bind-base')
const search = require('./server/search')
const searchRoot = require('./server/search-root')
const buildEntries = require('./server/entries')
const contactCreate = require('./server/contact/create')
const contactUpdate = require('./server/contact/update')
const contactRemove = require('./server/contact/remove')

module.exports = function (config, options) {
  const { _ } = this.ndut.helper
  const { trimKey } = this.ndutLdap.helper
  const server = this.ndutLdap.helper.ldap.createServer()

  let entries = []

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
          entries = _.concat(entries, buildEntries.call(this, baseDn, options))
          bindBase.call(this, { server, site, entries, baseDn, options })
          searchRoot.call(this, { server, site, entries, options })
          search.call(this, { server, site, pre, entries, baseDn, options })
          if (!options.contacts.disabled) {
            contactCreate.call(this, { server, site, pre, entries, baseDn, options })
            contactUpdate.call(this, { server, site, pre, entries, baseDn, options })
            contactRemove.call(this, { server, site, pre, entries, baseDn, options })
          }
        })
        server.listen(options.server.port, () => {
          this.log.info(`LDAP Server is running at: ${server.url}`)
        })
        resolve()
      })
  })
}