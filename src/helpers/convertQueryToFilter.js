const { userTypes } = require('@src/constants/userTypes')

const attributeFilters = {
  uid: (value) => `uid=${value}`,
  cn: (value) => `cn=${value}`,
  username: (value) => `uid=${value}`,
  ci: (value) => `ci=${value}`,
  email: (value) => `maildrop=${value}`,
}

const userTypeFilters = {
  student: userTypes[0],
  docent_employee: userTypes[1],
  employee: userTypes[2],
}

const createLdapFilterFromQuery = (query) => {
  const filters = []

  for (const key in query) {
    if (attributeFilters[key] && query[key]) {
      filters.push(`(${attributeFilters[key](query[key])})`)
    } else if (key === 'userType' && userTypeFilters[query[key]]) {
      filters.push(`(userType=${userTypeFilters[query[key]]})`)
    }
  }

  if (filters.length === 0) {
    return ''
  }

  // Combine multiple filters using logical AND
  const ldapFilter = filters.join('')

  return ldapFilter
}

module.exports = { createLdapFilterFromQuery }
