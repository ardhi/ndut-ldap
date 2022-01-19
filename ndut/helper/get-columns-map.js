module.exports = function (lowerCaseAttr) {
  const { _ } = this.ndut.helper
  const columns = {
    cn: 'firstName',
    givenName: 'firstName',
    sn: 'lastName',
    company: 'company',
    department: 'department',
    street: 'address1',
    streetAddress: 'address2',
    l: 'city',
    postalCode: 'zipCode',
    st: 'state',
    co: 'country',
    telephoneNumber: 'phone',
    mailrfc822Mailbox: 'email',
    wwwHomepage: 'website',
    description: 'remark'
  }
  let result = _.cloneDeep(columns)
  if (lowerCaseAttr) {
    result = {}
    _.forOwn(columns, (v, k) => {
      result[k.toLowerCase()] = v
    })
  }
  return result
}