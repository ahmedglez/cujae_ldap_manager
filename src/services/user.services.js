const boom = require('@hapi/boom')
require('dotenv').config({ path: __dirname + '/../../.env' })
const config = require('../config/config')
const assert = require('assert')
const searchSchema = require('../utils/ldap_search_utils')
const searchSchemaWithoutFormat = require('../utils/searchSchemaWithNoFormat')
const ldapClient = require('../connections/LDAP_client')

const UserServices = () => {
  const getAll = (branch, filter) => {
    console.log('filter', filter)
    const dn =
      branch === undefined ? config.ldap.dn : `ou=${branch},${config.ldap.dn}`
    const opts = {
      filter: filter,
      scope: 'sub',
      attributes: ['uid', 'cn', 'mail', 'ci', 'sex', 'year'],
      sizeLimit: config.ldap.sizeLimit,
      timeLimit: 50000,
    }
    return searchSchema(dn, opts)
  }

  const getByYear = (year = 1, branch) => {
    const dn =
      branch === undefined ? config.ldap.dn : `ou=${branch},${config.ldap.dn}`
    const opts = {
      filter: `(studentYear=${year})`,
      scope: 'sub',
      attributes: ['uid', 'cn', 'mail', 'ci'],
      sizeLimit: config.ldap.sizeLimit,
    }
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
      pccValue = PCC === 'true' ? 'TRUE' : 'FALSE'
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

  const getByUsernameWithNoFormat = (username) => {
    const opts = {
      filter: `(uid=${username})`,
      scope: 'sub',
      timeLimit: 60,
    }
    return searchSchemaWithoutFormat(config.ldap.dn, opts)
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

  const addNewUser = (user, branch) => {
    const dn = `uid=${user.uid},ou=usuarios,ou=${branch},${config.ldap.dn}`

    const entry = {
      ...user,
      objectclass: [
        'top',
        'person',
        'posixAccount',
        'iesServices',
        'sambaSamAccount',
        'radiusprofile',
        'CourierMailAlias',
      ],
      homeDirectory: `/home/${user.uid}`,
      gidNumber: [1000],
      sambaSID: ['S-1-5-21-1255719363-1350762778-3568053751-513'],
      sambaLMPassword: [new TextEncoder().encode('sambaLMPassword')],
      sambaNTPassword: [new TextEncoder().encode('sambaNTPassword')],
      loginShell: [new TextEncoder().encode('/bin/nosh')],
      sambaacctflags: [new TextEncoder().encode('[U          ]')],
      sambapasswordhistory: [
        new TextEncoder().encode(
          '000000000000000000000000000000000000000000000000000000 0000000000'
        ),
      ],
      sambaprimarygroupsid: ['S-1-5-21-1255719363-1350762778-3568053751-513'],
      sambapwdlastset: [new TextEncoder().encode('1308584948')],
    }
    return new Promise((resolve, reject) => {
      ldapClient.add(dn, entry, (err) => {
        if (err) {
          console.log('ERROR', err)
          reject(boom.badImplementation(err))
        }
        resolve({ message: 'User added successfully' })
      })
    })
  }

  return {
    getAll,
    getByYear,
    getByUsername,
    getByUsernameWithNoFormat,
    getByCI,
    getByEmail,
    getStudents,
    getProfessors,
    addNewUser,
  }
}

module.exports = UserServices
