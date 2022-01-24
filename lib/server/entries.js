module.exports = function (baseDn, options) {
  const { _ } = this.ndut.helper
  const baseName = _.map(baseDn.split(','), b => b.split('=')[1]).join('.')
  const entries = [{
    dn: '',
    structuralObjectClass: 'OpenLDAProotDSE',
		configContext: 'cn=config',
		attributes: {
			objectclass: ['top', 'OpenLDAProotDS'],
			namingContexts: [baseDn],
			supportedLDAPVersion: ['3'],
			subschemaSubentry:['cn=Subschema']
		}
  }, {
		dn: 'cn=Subschema',
		attributes: {
			objectclass: ['top', 'subentry', 'subschema', 'extensibleObject'],
			cn: ['Subschema']
		}
	}, {
    dn: baseDn,
    attributes: {
      objectClass: ['top', 'dcObject', 'organization'],
      hasSubordinates: ['TRUE'],
      dc: baseName
    }
  }]
  if (!options.users.disabled) entries.push({
    dn: `ou=${options.users.ou},${baseDn}`,
    attributes: {
      objectClass: ['top', 'organizationalUnit'],
      hasSubordinates: ['TRUE'],
      ou: options.users.ou
    }
  })
  if (!options.contacts.disabled) entries.push({
    dn: `ou=${options.contacts.ou},${baseDn}`,
    attributes: {
      objectClass: ['top', 'organizationalUnit'],
      hasSubordinates: ['TRUE'],
      ou: options.contacts.ou
    }
  })
  return entries
}
