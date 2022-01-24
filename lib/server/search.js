const contactList = require('./contact/list')
const contactGet = require('./contact/get')
const level = (text = '') => text.split(',').length - 1

module.exports = function ({ server, site, pre, entries, baseDn, options }) {
  const { _ } = this.ndut.helper
  const { ldap, trimKey } = this.ndutLdap.helper
  server.search(baseDn, pre, (req, res, next) => {
    const key = trimKey(req.dn.toString())
    const item = _.find(entries, { dn: key })
    if (key === `ou=${options.contacts.ou},${baseDn}` && !options.contacts.disabled) {
      if (req.scope === 'base') {
        res.send(item)
        res.end()
        next()
      } else if (['one', 'sub'].includes(req.scope)) {
        contactList.call(this, { req, res, next, baseDn, entries, options })
          .then()
      }
    } else if (item) {
      if (req.scope === 'base') res.send(item)
      if (req.scope === 'one') {
        const data = _.filter(entries, t => {
          const dn = ldap.parseDN(t.dn)
          return dn.childOf(item.dn) && (level(t.dn) === level(key) + 1)
        })
        _.each(data, d => {
          res.send(d)
        })
      }
      res.end()
      next()
    } else if (key.includes(`,ou=${options.contacts.ou},`) && req.scope === 'base' && !options.contacts.disabled) {
      contactGet.call(this, { req, res, next, entries, options })
        .then()
    } else {
      res.end()
      next()
    }
  })
}
