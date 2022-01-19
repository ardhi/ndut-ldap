module.exports = function (address, lowerCaseAttr) {
  const { _, aneka } = this.ndut.helper
  const { getColumnsMap } = this.ndutLdap.helper
  const { isSet } = aneka
  const columnsMap = getColumnsMap(lowerCaseAttr)
  /*
  let street = _.without([address.address1, address.address2], null, undefined, '')
  street = _.isEmpty(street) ? null : street.join(', ')
  */
  const attributes = {}
  _.forOwn(columnsMap, (v, k) => {
    attributes[k] = address[v]
  })
  attributes.cn = `${address.firstName} ${address.lastName}`
  _.forOwn(attributes, v => {
    if (isSet(v) && _.isString(v)) v = _.trim(v)
  })
  return attributes
}
