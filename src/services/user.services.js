require('dotenv').config({ path: __dirname + '/../../.env' })
const config = require('@src/config/config')
const assert = require('assert')
const searchSchema = require('@src/utils/ldap_search_utils')
const searchSchemaWithoutFormat = require('@src/utils/searchSchemaWithNoFormat')
const ldapClient = require('@src/connections/LDAP_client')
const { performLdapSearch } = require('@src/helpers/ldapUtils')

const UserServices = () => {
  const getAll = (branch, filter) => {
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

  const handleFilteredSearch = async (
    baseDN = config.ldap.base,
    ldapFilter,
    att,
    page = 1,
    limit = 10
  ) => {
    const attributes = att === undefined ? ['dn', 'uid', 'cn'] : att
    const startIndex = (page - 1) * limit
    const results = await performLdapSearch(baseDN, ldapFilter, attributes)
    return results.slice(startIndex, limit * page)
  }

  const getByUsername = (username) => {
    const opts = {
      filter: `(uid=${username})`,
      scope: 'sub',
      timeLimit: 60,
    }
    return searchSchema(config.ldap.dn, opts)
  }

  return {
    getAll,
    getByUsername,
    handleFilteredSearch,
  }
}

module.exports = UserServices
