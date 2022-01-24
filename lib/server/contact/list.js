const columns = require('../columns.json')

module.exports = function ({ req, res, next, baseDn, entries, options }) {
  const { _, dumpError, aneka } = this.ndut.helper
  const { ldap, filterToQuery, contactToAttributes } = this.ndutLdap.helper
  return new Promise((resolve, reject) => {
    const model = this.ndutDb.model.AbContact
    if (!model) {
      res.end()
      next()
      resolve()
      return
    }
    filterToQuery(req.filter)
      .then(where => {
        where.userId = _.find(entries, { dn: req.user }).attributes.uid
        return model.find({ where })
      })
      .then(results => {
        _.each(results, r => {
          const attributes = contactToAttributes(_.pick(r, columns), options.lowerCaseAttr)
          res.send({
            dn: `cn=${r.firstName} ${r.lastName},ou=contacts,${baseDn}`,
            attributes
          })
        })
        res.end()
        next()
        resolve()
      })
      .catch(err => {
        next(new ldap.OtherError(err.message))
        dumpError(err)
        resolve()
      })
  })
}
