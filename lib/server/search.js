const searchContact = require('./search-contact')
const getContact = require('./get-contact')
const level = (text = '') => text.split(',').length - 1

module.exports = function ({ server, site, pre, trees, baseDn, options }) {
  const { _ } = this.ndut.helper
  const { ldap, trimKey } = this.ndutLdap.helper
  server.search(baseDn, pre, (req, res, next) => {
    const key = trimKey(req.dn.toString())
    const item = _.find(trees, { dn: key })
    if (key === `ou=contacts,${baseDn}`) {
      if (req.scope === 'base') {
        res.send(item)
        res.end()
        next()
      } else if (['one', 'sub'].includes(req.scope)) {
        searchContact.call(this, { req, res, next, baseDn, trees, options })
          .then()
      }
    } else if (item) {
      if (req.scope === 'base') res.send(item)
      if (req.scope === 'one') {
        const data = _.filter(trees, t => {
          const dn = ldap.parseDN(t.dn)
          return dn.childOf(item.dn) && (level(t.dn) === level(key) + 1)
        })
        _.each(data, d => {
          res.send(d)
        })
      }
      res.end()
      next()
    } else if (key.includes(',ou=contacts,') && req.scope === 'base') {
      getContact.call(this, { req, res, next, trees, options })
        .then()
    } else {
      res.end()
      next()
    }
  })
}

