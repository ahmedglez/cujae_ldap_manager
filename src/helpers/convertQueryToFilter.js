const { userTypes } = require('@src/constants/userTypes')

const attributeFilters = {
  uid: (value) => `uid=${value}`,
  cn: (value) => `cn=${value}`,
  username: (value) => `uid=${value}`,
  CI: (value) => `CI=${value}`,
  ci: (value) => `CI=${value}`,
  email: (value) => `maildrop=${value}`,
  lastName: (value) => `lastName=${value}`,
  lastname: (value) => `lastName=${value}`,
  name: (value) => `name=${value}`,
  middleName: (value) => `middleName=${value}`,
  middlename: (value) => `middleName=${value}`,
  sex: (value) => `sex=${value}`,
  area: (value) => `area=${value}`,
  userCondition: (value) => `userCondition=${value}`,
  usercondition: (value) => `userCondition=${value}`,
  userStatus: (value) => `userStatus=${value}`,
  userstatus: (value) => `userStatus=${value}`,
  sedeMunicipio: (value) => `sedeMunicipio=${value}`,
  sedemunicipio: (value) => `sedeMunicipio=${value}`,
  userInformation: (value) => `userInformation=${value}`,
  userinformation: (value) => `userInformation=${value}`,
  career: (value) => `career=${value}`,
  studentClassGroup: (value) => `studentClassGroup=${value}`,
  studentclassGroup: (value) => `studentClassGroup=${value}`,
  studentclassgroup: (value) => `studentClassGroup=${value}`,
  studentYear: (value) => `studentYear=${value}`,
  studentyear: (value) => `studentYear=${value}`,
  country: (value) => `country=${value}`,
  UJC: (value) => `UJC=${value}`,
  ujc: (value) => `UJC=${value}`,
  skinColor: (value) => `skinColor=${value}`,
  skincolor: (value) => `skinColor=${value}`,
  sn: (value) => `sn=${value}`,
  SN: (value) => `sn=${value}`,
  Sn: (value) => `sn=${value}`,
  displayName: (value) => `displayName=${value}`,
  displayname: (value) => `displayName=${value}`,
  mail: (value) => `mail=${value}`,
  maildrop: (value) => `maildrop=${value}`,
  objectName: (value) => `objectName=${value}`,
  objectname: (value) => `objectName=${value}`,
  dn: (value) => `dn=${value}`,
  workerID: (value) => `workerID=${value}`,
  workerId: (value) => `workerID=${value}`,
  workerid: (value) => `workerID=${value}`,
  workArea: (value) => `workArea=${value}`,
  workarea: (value) => `workArea=${value}`,
  nameInstitution: (value) => `nameInstitution=${value}`,
  nameinstitution: (value) => `nameInstitution=${value}`,
  workerContract: (value) => `workercontract=${value}`,
  workercontract: (value) => `workercontract=${value}`,
  userYears: (value) => `userYears=${value}`,
  useryears: (value) => `userYears=${value}`,
  schoolLevel: (value) => `schoolLevel=${value}`,
  schoollevel: (value) => `schoolLevel=${value}`,
  orgRole: (value) => `orgRole=${value}`,
  orgrole: (value) => `orgRole=${value}`,
  educationalCategory: (value) => `educationalCategory=${value}`,
  educationalcategory: (value) => `educationalCategory=${value}`,
  scientificCategory: (value) => `scientificCategory=${value}`,
  scientificcategory: (value) => `scientificCategory=${value}`,
  OU: (value) => `ou=${value}`,
  Ou: (value) => `ou=${value}`,
  ou: (value) => `ou=${value}`,
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
