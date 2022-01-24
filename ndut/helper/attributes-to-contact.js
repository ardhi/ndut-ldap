module.exports = function (attributes, lowerCaseAttr) {
  const { _, aneka } = this.ndut.helper
  const { getColumnsMap } = this.ndutLdap.helper
  const { isSet } = aneka
  const columnsMap = getColumnsMap(lowerCaseAttr)
  delete columnsMap.cn
  const entry = {}
  _.forOwn(columnsMap, (v, k) => {
    const key = lowerCaseAttr ? k.toLowerCase() : k
    if (!isSet(attributes[key])) return
    entry[v] = attributes[key]
  })
  _.forOwn(entry, v => {
    if (_.isString(v)) v = _.trim(v)
  })
  return entry
}
