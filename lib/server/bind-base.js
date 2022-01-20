const columns = require('./columns.json')
const tree = require('./tree')

const handleCnFormat = function (key) {
  const { _ } = this.ndut.helper
  const keys = key.split(',')
  if (keys[1] !== 'ou=users') throw new Error('Unknown base DN')
  const parts = _.map(keys[0].split('='), k => _.trim(k))
  if (parts[0] !== 'cn') throw new Error('Unknown base DN')
  return parts[1]
}

module.exports = function ({ server, site, trees, baseDn }) {
  const { _ } = this.ndut.helper
  const { ldap, contactToAttributes, trimKey } = this.ndutLdap.helper
  const { getUserByUsernamePassword } = this.ndutAuth.helper
  server.bind(baseDn, (req, res, next) => {
    const key = trimKey(req.dn.toString())
    let username
    try {
      username = handleCnFormat.call(this, trimKey(key, baseDn))
    } catch (err) {
      return next(new ldap.OtherError(err.message))
    }
    const password = req.credentials
    getUserByUsernamePassword(username, password, site.id)
      .then(user => {
        if (!_.find(trees, { dn: key })) {
          const attributes = contactToAttributes(_.pick(user, columns))
          trees.push({
            dn: key,
            attributes
          })
        }
        res.end()
        next()
      })
      .catch(err => {
        next(new ldap.InvalidCredentialsError())
      })
  })
}
