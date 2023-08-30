/* thank you chatgpt */
const { userTypes } = require('@src/constants/userTypes')

const userTypeFilters = {
  student: userTypes[0],
  employee: userTypes[1],
  docent_employee: userTypes[2],
}

const createLdapFilterFromQuery = (query) => {
  const filters = []

  if (query && Object.keys(query).length === 2) {
    return ''
  }

  if (query.uid) {
    filters.push(`(uid=${query.uid})`)
  }

  if (query.cn) {
    filters.push(`(cn=${query.cn})`)
  }

  if (query.username) {
    filters.push(`(uid=${query.username})`)
  }

  if (query.ci) {
    filters.push(`(ci=${query.ci})`)
  }

  if (query.email) {
    filters.push(`(maildrop=${query.email})`)
  }

  if (query.userType && userTypeFilters[query.userType]) {
    filters.push(`(userType=${userTypeFilters[query.userType]})`)
  }

  // Combine multiple filters using logical AND
  const ldapFilter = `${filters.join('')}`

  return ldapFilter
}

module.exports = { createLdapFilterFromQuery }
