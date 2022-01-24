module.exports = function (lowerCaseAttr) {
  const { _ } = this.ndut.helper
  const columns = {
    // cn: 'firstName',
    givenName: 'firstName',
    sn: 'lastName',
    title: 'title',
    o: 'company',
    department: 'department',
    street: 'address',
    l: 'city',
    postalCode: 'zipCode',
    st: 'state',
    co: 'country',
    telephoneNumber: 'phone',
    mail: 'email',
    wwwHomepage: 'website',
    description: 'remark',
    uid: 'id',
    mobile: 'mobilePhone',
    homePhone: 'homePhone',
    homePostalAddress: 'homeAddress'
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