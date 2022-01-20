module.exports = function (key, base = '') {
  const { _ } = this.ndut.helper
  return _.trim(_.map(key.split(','), k => _.trim(k)).join(',').replace(base, ''), ',')
}