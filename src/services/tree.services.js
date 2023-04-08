const boom = require('@hapi/boom')
const ldap = require('../connections/LDAP_client')
const config = require('../config/config')
const assert = require('assert')
const LDAP = require('ldapjs')
const searchSchema = require('../utils/ldap_search_utils')

ldap.bind(
  'uid=agonzalezb,ou=usuarios,ou=informatica,dc=cujae,dc=edu,dc=cu',
  '00092068426',
  (err) => {
    assert.ifError(err)
  }
)
const PROFESSORS_CLASS = config.ldap.objectClasses[5].name
const STUDENT_CLASS = config.ldap.objectClasses[3].name

const TreeServices = () => {
  const getAllProffesors = () => {
    const filter = `(objectclass=${PROFESSORS_CLASS})`
    return searchSchema(filter)
  }

  const getAllStudents = () => {
    const filter = `(objectclass=${STUDENT_CLASS})`
    return searchSchema(filter)
  }

  const getUsersByYear = (year) => {
    const filter = `(userYears=${year})`
    return searchSchema(filter)
  }

  const getUsersByBranch = (branch) => {
    const dnByBranch = `ou=${branch},${config.ldap.dn}`
    const filter = `objectclass=*`
    return searchSchema(filter, dnByBranch)
  }

  const getUsersByYearAndBranch = (year, branch, type) => {
    const dnByBranch = `ou=${branch},${config.ldap.dn}`
    const filter = `objectclass=${type} AND studentClassGroup>=${year * 10}`
  }

  return {
    getAllProffesors,
    getAllStudents,
    getUsersByYear,
    getUsersByBranch,
    getUsersByYearAndBranch,
  }
}

module.exports = TreeServices
