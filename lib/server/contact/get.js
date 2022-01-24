const columns = require('../columns.json')

module.exports = function ({ req, res, next, entries, options }) {
  const { _ } = this.ndut.helper
  const { ldap, contactToAttributes, trimKey } = this.ndutLdap.helper
  const key = trimKey(req.dn.toString())
  const [firstName, lastName] = key.split(',')[0].split('=')[1].split(' ')
  return new Promise((resolve, reject) => {
    const model = this.ndutDb.model.AbContact
    if (!model) {
      res.end()
      next()
      resolve()
      return
    }
    const userId = _.find(entries, { dn: req.user }).attributes.uid
    model.find({ where: { userId, firstName, lastName } })
      .then(results => {
        if (results.length === 0) {
          res.end()
          next()
          resolve()
          return
        }
        res.send({
          dn: key,
          attributes: contactToAttributes(_.pick(results[0], columns), options.lowerCaseAttr)
        })
        res.end()
        next()
        resolve()
        return
      })
      .catch(err => {
        dumpError(err)
        next(new ldap.OtherError(err.message))
        resolve()
      })
  })
}
