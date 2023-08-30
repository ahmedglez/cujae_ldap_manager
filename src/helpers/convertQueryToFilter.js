/* thank you chatgpt */
const createLdapFilterFromQuery = (query) => {
  const filters = []

  if (query.uid) {
    filters.push(`uid=${query.uid}`)
  }

  if (query.cn) {
    filters.push(`cn=${query.cn}`)
  }

  if (query.username) {
    filters.push(`uid=${query.username}`)
  }

  if (query.ci) {
    filters.push(`ci=${query.ci}`)
  }

  // Combine multiple filters using logical AND
  const ldapFilter = `(${filters.join('')})`

  return ldapFilter
}

module.exports = { createLdapFilterFromQuery }
