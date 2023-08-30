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

    try {
      const results = await performLdapSearch(baseDN, ldapFilter, attributes)

      return results.slice(startIndex, limit * page)
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  const getByUsername = async (username) => {
    const results = await performLdapSearch(
      config.ldap.base,
      `(uid=${username})`
    )
    console.log('results', results)
    return results
  }

  return {
    getAll,
    getByUsername,
    handleFilteredSearch,
  }
}

module.exports = UserServices
