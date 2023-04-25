const boom = require('@hapi/boom')
require('dotenv').config({ path: __dirname + '/../../.env' })
const ldap = require('../connections/LDAP_client')
const LDAP = require('ldapjs')
const config = require('../config/config')
const assert = require('assert')
const searchSchema = require('../utils/ldap_search_utils')

const UserServices = () => {
  const getAll = (branch) => {
    const dn =
      branch === undefined ? config.ldap.dn : `ou=${branch},${config.ldap.dn}`
    const opts = {
      filter: '(objectClass=person)',
      scope: 'sub',
      attributes: ['uid', 'cn', 'mail', 'ci'],
      sizeLimit: config.ldap.sizeLimit,
    }
    console.log(opts)

    return searchSchema(dn, opts)
  }

  const getStudents = (branch, group, year) => {
    const getfilter = () => {
      let filter = ''
      if (group !== undefined) {
        filter = `(studentClassGroup=${parseInt(group)})`
      } else if (year !== undefined) {
        filter = `(studentClassGroup=${year}*)`
      } else {
        filter = `(objectClass=iesStudent)`
      }
      return filter
    }
    const dn =
      branch === undefined ? config.ldap.dn : `ou=${branch},${config.ldap.dn}`
    const opts = {
      filter: getfilter(),
      scope: 'sub',
      attributes: [
        'uid',
        'cn',
        'mail',
        'ci',
        'studentClassGroup',
        'displayName',
      ],
      sizeLimit: config.ldap.sizeLimit,
    }
    return searchSchema(dn, opts)
  }

  const getProfessors = (
    page,
    branch,
    orgRole = undefined,
    PCC = undefined,
    researchGroup = undefined
  ) => {
    const dn =
      branch === undefined ? config.ldap.dn : `ou=${branch},${config.ldap.dn}`

    var pccValue = PCC

    if (PCC !== undefined) {
      pccValue = PCC === true ? 'TRUE' : 'FALSE'
    }
    const basefilter = '(objectClass=iesEducationalStaff)'
    const pCCfilter = PCC !== undefined ? `(PCC=${pccValue})` : ''
    const roleFilter = orgRole !== undefined ? `(orgRole=${orgRole})` : ''
    const researchGroupFilter =
      researchGroup !== undefined ? `(researchGroup=${researchGroup})` : ''

    const filters = `(&${basefilter}${pCCfilter}${roleFilter}${researchGroupFilter})`

    const opts = {
      filter: filters,
      scope: 'sub',
      attributes: [
        'uid',
        'cn',
        'mail',
        'ci',
        'displayName',
        'orgRole',
        'PCC',
        'researchGroup',
      ],
      paged: page === undefined ? false : true,
      pageNum: page === undefined ? undefined : parseInt(page),
      sizeLimit: page === undefined ? 500 : undefined,
    }
    return searchSchema(dn, opts)
  }

  const getByUsername = (username) => {
    const opts = {
      filter: `(uid=${username})`,
      scope: 'sub',
      timeLimit: 60,
    }
    return searchSchema(config.ldap.dn, opts)
  }

  const getByCI = (ci) => {
    const opts = {
      filter: `(ci=${ci})`,
      scope: 'sub',
    }
    return searchSchema(config.ldap.dn, opts)
  }

  const getByEmail = (email) => {
    const opts = {
      filter: `(maildrop=${email})`,
      scope: 'sub',
    }
    return searchSchema(config.ldap.dn, opts)
  }

  return {
    getAll,
    getByUsername,
    getByCI,
    getByEmail,
    getStudents,
    getProfessors,
  }
}

module.exports = UserServices
