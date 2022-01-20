module.exports = function (baseDn) {
  const { _ } = this.ndut.helper
  const baseName = _.map(baseDn.split(','), b => b.split('=')[1]).join('.')
  return [{
    dn: baseDn,
    attributes: {
      objectClass: ['top', 'domain'],
      dc: baseName
    }
  }, {
    dn: `ou=users,${baseDn}`,
    attributes: {
      objectClass: ['top', 'organizationalUnit'],
      ou: 'users'
    }
  }, {
    dn: `ou=contacts,${baseDn}`,
    attributes: {
      objectClass: ['top', 'organizationalUnit'],
      ou: 'contacts'
    }
  }]
}