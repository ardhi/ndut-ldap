const columns = require('../columns.json')

module.exports = function ({ pre, baseDn, server, entries, options }) {
  const { _, dumpError } = this.ndut.helper
  const { ldap, trimKey } = this.ndutLdap.helper
  baseDn = `ou=${options.contacts.ou},${baseDn}`
  const model = this.ndutDb.model.AbContact
  if (!model) return
  server.del(baseDn, pre, (req, res, next) => {
    const dn = trimKey(req.dn.toString())
    const user = _.find(entries, { dn: req.user }).attributes
    let [firstName, lastName] = dn.split(',')[0].split('=')[1].split(' ')
    lastName = lastName || ''
    const where = {
      userId: user.uid,
      siteId: user.siteId,
      firstName,
      lastName
    }
    model.find({ where })
      .then(results => {
        if (results.length === 0) throw 'notexists'
        return model.remove({ id: results[0].id })
      })
      .then(result => {
        res.end()
        next()
      })
      .catch(err => {
        dumpError(err)
        if (err === 'notexists') return next(new ldap.NoSuchObjectError(dn))
        next(new ldap.OtherError(err.message))
      })
  })
}
