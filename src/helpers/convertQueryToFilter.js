/* thank you chatgpt */
const createLdapFilterFromQuery = (query) => {
  const filters = []

  if (query.uid) {
    filters.push(`uid=${query.uid}`)
  }

  if (query.cn) {
    filters.push(`cn=${query.cn}`)
  }

  // Combine multiple filters using logical AND
  const ldapFilter = `(${filters.join('')})`

  return ldapFilter
}

module.exports = { createLdapFilterFromQuery }