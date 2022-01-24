module.exports = function (address, lowerCaseAttr) {
  const { _, aneka } = this.ndut.helper
  const { getColumnsMap } = this.ndutLdap.helper
  const { isSet } = aneka
  const columnsMap = getColumnsMap(lowerCaseAttr)
  const attributes = {}
  _.forOwn(columnsMap, (v, k) => {
    if (!isSet(address[v])) return
    attributes[k] = address[v]
  })
  // attributes.cn = `${address.firstName} ${address.lastName}`
  let oc = 'objectClass'
  if (lowerCaseAttr) oc = oc.toLocaleLowerCase()
  attributes[oc] = ['top', 'inetOrgPerson']
  _.forOwn(attributes, v => {
    if (_.isString(v)) v = _.trim(v)
  })
  return attributes
}
