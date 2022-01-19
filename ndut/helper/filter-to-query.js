

module.exports = async function (filter, mapper) {
  const { getColumnsMap } = this.ndutLdap.helper
  if (!mapper) mapper = getColumnsMap(true) // search on ldap is ALWAYS case insensitive
  const q = {}

  if (filter.type === 'and' || filter.type === 'or') {
    q[filter.type] = []
    for (let i = 0; i < filter.filters.length; i++) {
      const val = parse(filter.filters[i])
      q[filter.type].push(val)
    }
  }
  if (['equal', 'approx'].includes(filter.type)) {
    q[mapper[filter.attribute.toLowerCase()]] = filter.value
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
    q[mapper[filter.attribute.toLowerCase()]] = items.length > 1 ? { and: items } : items[0]
  }
  if (filter.type === 'ge') {
    q[mapper[filter.attribute.toLowerCase()]] = { gte: filter.value }
  }
  if (filter.type === 'le') {
    q[mapper[filter.attribute.toLowerCase()]] = { lte: filter.value }
  }
  if (filter.type === 'not') {
    q[mapper[filter.attribute.toLowerCase()]] = { neq: filter.value }
  }
  return q
}
