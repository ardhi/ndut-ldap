const columns = require('../columns.json')

module.exports = function ({ pre, baseDn, server, entries, options }) {
  const { _, dumpError } = this.ndut.helper
  const { ldap, attributesToContact } = this.ndutLdap.helper
  baseDn = `ou=${options.contacts.ou},${baseDn}`
  const model = this.ndutDb.model.AbContact
  if (!model) return
  server.add(baseDn, pre, (req, res, next) => {
    const dn = req.dn.toString()
    const attr = req.toObject().attributes
    _.forOwn(attr, (v, k) => {
      if (_.isArray(v)) attr[k] = v[0]
    })
    if (_.isEmpty(attr.firstName) || _.isEmpty(attr.lastName)) {
      return next(new ldap.ConstraintViolationError('Both given name and surename are required'))
    }
    const user = _.find(entries, { dn: req.user }).attributes
    const where = {
      userId: user.uid,
      siteId: user.siteId,
      firstName: attr.givenname || '',
      lastName: attr.sn || ''
    }
    model.find({ where })
      .then(results => {
        if (results.length > 0) throw 'exists'
        const contact = attributesToContact(attr, options.lowerCaseAttr)
        contact.userId = user.uid
        contact.siteId = user.siteId
        return model.create(contact)
      })
      .then(result => {
        res.end()
        next()
      })
      .catch(err => {
        dumpError(err)
        if (err === 'exists') return next(new ldap.EntryAlreadyExistsError(dn))
        next(new ldap.OtherError(err.message))
      })
  })
}
