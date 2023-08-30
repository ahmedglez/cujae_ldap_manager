const boom = require('@hapi/boom')
require('dotenv').config({ path: __dirname + '/../../.env' })
const ldap = require('@src/connections/LDAP_client')
const LDAP = require('ldapjs')
const config = require('@src/config/config')
const assert = require('assert')
const searchSchema = require('@src/utils/ldap_search_utils')
const { performLdapSearch } = require('@src/helpers/ldapUtils')

const GroupServices = () => {
  const getGroup = async (group) => {
    try {
      const baseDN = config.ldap.base
      const ldapFilter = `(ou=${group})`
      const results = await performLdapSearch(baseDN, ldapFilter)
      if (results[0] === undefined) {
        throw new Error('No existe ese grupo')
      } else {
        return results
      }
    } catch (err) {
      console.error(err)
      throw err
    }
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
    getAdminsGroups,
    getGroup,
  }
}

module.exports = GroupServices
