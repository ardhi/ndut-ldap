const columns = require('./columns.json')

const handleCnFormat = function (key, options) {
  const { _ } = this.ndut.helper
  const keys = key.split(',')
  if (keys[1] !== `ou=${options.users.ou}`) throw new Error('Unknown base DN')
  const parts = _.map(keys[0].split('='), k => _.trim(k))
  if (parts[0] !== 'cn') throw new Error('Unknown base DN')
  return parts[1]
}

module.exports = function ({ server, site, entries, baseDn, options }) {
  const { _, dumpError } = this.ndut.helper
  const { ldap, contactToAttributes, trimKey } = this.ndutLdap.helper
  const { getUserByUsernamePassword } = this.ndutAuth.helper
  server.bind(baseDn, (req, res, next) => {
    const key = trimKey(req.dn.toString())
    let username
    try {
      username = handleCnFormat.call(this, trimKey(key, baseDn), options)
    } catch (err) {
      dumpError(err)
      return next(new ldap.OtherError(err.message))
    }
    const password = req.credentials
    getUserByUsernamePassword(username, password, site.id)
      .then(user => {
        if (!_.find(entries, { dn: key })) {
          const attributes = contactToAttributes(_.pick(user, columns))
          attributes.siteId = user.siteId
          entries.push({
            dn: key,
            attributes
          })
        }
        res.end()
        next()
      })
      .catch(err => {
        dumpError(err)
        next(new ldap.InvalidCredentialsError())
      })
  })
}
