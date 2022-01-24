module.exports = function ({ server, site, pre, entries, options }) {
  const { _ } = this.ndut.helper
  const { ldap, trimKey } = this.ndutLdap.helper
  server.search('', (req, res, next) => {
    if (req.scope === 'base' && req.filter.toString() === '(objectclass=*)' && req.baseObject === '') {
      res.send(_.find(entries, { dn: '' }))
    }
    res.end()
    return next()
  })
  const subschema = 'cn=Subschema'
  server.search(subschema, (req, res, next) => {
    res.send(_.find(entries, { dn: subschema }))
    res.end()
    return next()
  })
}

