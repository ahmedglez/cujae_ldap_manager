const boom = require('@hapi/boom')
require('dotenv').config({ path: __dirname + '/../../.env' })
const ldap = require('../connections/LDAP_client')
const LDAP = require('ldapjs')
const config = require('../config/config')
const assert = require('assert')
const searchSchema = require('../utils/ldap_search_utils')

const GroupServices = () => {
  const getAll = (branch) => {
    const dn =
      branch === undefined ? config.ldap.dn : `ou=${branch},${config.ldap.dn}`
    const opts = {
      filter: `(objectClass=posixGroup)`,
      scope: 'sub',
    }
    return searchSchema(dn, opts)
  }

  const getAdminsGroups = (branch) => {
    const dn =
      branch === undefined ? config.ldap.dn : `ou=${branch},${config.ldap.dn}`
    const opts = {
      filter: `(cn=admins)`,
      scope: 'sub',
    }
    return searchSchema(dn, opts)
  }
  return {
    getAll,
    getAdminsGroups,
  }
}

module.exports = GroupServices
