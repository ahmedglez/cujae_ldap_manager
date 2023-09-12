const { userTypes } = require('@src/constants/userTypes')

const attributeFilters = {
  uid: (value) => `uid=${value}`,
  cn: (value) => `cn=${value}`,
  username: (value) => `uid=${value}`,
  ci: (value) => `ci=${value}`,
  email: (value) => `maildrop=${value}`,
  lastName: (value) => `lastName=${value}`,
  sex: (value) => `sex=${value}`,
  area: (value) => `area=${value}`,
  userCondition: (value) => `userCondition=${value}`,
  userStatus: (value) => `userStatus=${value}`,
  sedeMunicipio: (value) => `sedeMunicipio=${value}`,
  userInformation: (value) => `userInformation=${value}`,
  career: (value) => `career=${value}`,
  studentClassGroup: (value) => `studentClassGroup=${value}`,
  studentYear: (value) => `studentYear=${value}`,
  country: (value) => `country=${value}`,
  UJC: (value) => `UJC=${value}`,
  skinColor: (value) => `skinColor=${value}`,
  sn: (value) => `sn=${value}`,
  displayName: (value) => `displayName=${value}`,
  mail: (value) => `mail=${value}`,
  maildrop: (value) => `maildrop=${value}`,
  objectName: (value) => `objectName=${value}`,
  dn: (value) => `dn=${value}`,
  workerID: (value) => `workerID=${value}`,
  workArea: (value) => `workArea=${value}`,
  nameInstitution: (value) => `nameInstitution=${value}`,
  workercontract: (value) => `workercontract=${value}`,
  userYears: (value) => `userYears=${value}`,
  schoolLevel: (value) => `schoolLevel=${value}`,
  orgRole: (value) => `orgRole=${value}`,
  educationalCategory: (value) => `educationalCategory=${value}`,
  scientificCategory: (value) => `scientificCategory=${value}`,
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
