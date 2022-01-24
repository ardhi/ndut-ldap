

module.exports = async function (filter, mapper) {
  const { _ } = this.ndut.helper
  const { getColumnsMap, filterToQuery } = this.ndutLdap.helper
  if (!mapper) mapper = getColumnsMap(true) // search on ldap is ALWAYS case insensitive
  const q = {}
  let attr
  if (filter.attribute) attr = mapper[filter.attribute.toLowerCase()]

  if (filter.type === 'and' || filter.type === 'or') {
    q[filter.type] = []
    for (let i = 0; i < filter.filters.length; i++) {
      const val = await filterToQuery(filter.filters[i])
      if (!_.isEmpty(val)) q[filter.type].push(val)
    }
  }
  if (filter.type === 'present') {}
  if (filter.type === 'substring') {
    const items = []
    if (filter.initial) items.push({ like: `${filter.initial}%`})
    if (filter.final) items.push({ like: `%${filter.final}`})
    if (filter.any) {
      for (let i = 0; i < filter.any.length; i++) {
        items.push({ like: `%${filter.any[i]}%`})
      }
    }
    if (attr) q[attr] = items.length > 1 ? { and: items } : items[0]
  }
  if (attr && ['equal', 'approx'].includes(filter.type)) q[attr] = filter.value
  if (attr && filter.type === 'ge') q[attr] = { gte: filter.value }
  if (attr && filter.type === 'le') q[attr] = { lte: filter.value }
  if (attr && filter.type === 'not') q[attr] = { neq: filter.value }
  return q
}
