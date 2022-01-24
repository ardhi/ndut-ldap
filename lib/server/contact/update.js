module.exports = function ({ pre, baseDn, server, entries, options }) {
  const { _, dumpError } = this.ndut.helper
  const { ldap, trimKey, attributesToContact, contactToAttributes } = this.ndutLdap.helper
  baseDn = `ou=${options.contacts.ou},${baseDn}`
  const model = this.ndutDb.model.AbContact
  if (!model) return
  server.modify(baseDn, pre, (req, res, next) => {
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
        const id = results[0].id
        const entry = contactToAttributes(_.omit(results[0], ['id']), options.lowerCaseAttr)
        for (const change of req.changes) {
          const mod = change.modification
          switch (change.operation) {
            case 'replace':
              if (!mod.vals || !mod.vals.length) {
                delete entry[mod.type]
              } else {
                entry[mod.type] = mod.vals
              }
              break
            case 'add':
              if (!entry[mod.type]) {
                entry[mod.type] = mod.vals
              } else {
                for (const v of mod.vals) {
                  if (entry[mod.type].indexOf(v) === -1)
                    entry[mod.type].push(v);
                }
              }
              break
            case 'delete':
              delete entry[mod.type]
              break
          }
        }
        const newRec = attributesToContact(entry, options.lowerCaseAttr)
        _.forOwn(newRec, (v, k) => {
          if (_.isArray(v)) newRec[k] = v[0]
        })
        return model.update({ id }, newRec)
      })
      .then(() => {
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
