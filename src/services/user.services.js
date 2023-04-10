const boom = require('@hapi/boom')
require('dotenv').config({ path: __dirname + '/../../.env' })
const ldap = require('../connections/LDAP_client')
const LDAP = require('ldapjs')
const config = require('../config/config')
const assert = require('assert')
const searchSchema = require('../utils/ldap_search_utils')
ldap.bind(config.ldap.username_bind, config.ldap.password_bind, (err) => {
  assert.ifError(err)
})

const UserServices = () => {
  const getAll = (page, branch) => {
    const dn =
      branch === undefined ? config.ldap.dn : `ou=${branch},${config.ldap.dn}`
    const opts = {
      filter: '(objectClass=person)',
      scope: 'sub',
      attributes: ['uid', 'cn', 'mail', 'ci'],
      paged: page === undefined ? false : true,
      pageNum: page === undefined ? undefined : parseInt(page),
      sizeLimit: page === undefined ? 500 : undefined,
    }
    return searchSchema(dn, opts)
  }

  const getStudents = (page, branch, group) => {
    const dn =
      branch === undefined ? config.ldap.dn : `ou=${branch},${config.ldap.dn}`
    const opts = {
      filter:
        group !== undefined
          ? `(studentClassGroup=${parseInt(group)})`
          : `(objectClass=iesStudent)`,
      scope: 'sub',
      attributes: [
        'uid',
        'cn',
        'mail',
        'ci',
        'studentClassGroup',
        'displayName',
      ],
      paged: page === undefined ? false : true,
      pageNum: page === undefined ? undefined : parseInt(page),
      sizeLimit: page === undefined ? 500 : undefined,
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
    console.log('PCC VALUE', pccValue)

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
