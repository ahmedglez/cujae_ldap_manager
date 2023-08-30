require('dotenv').config({ path: __dirname + '/../../.env' })
const config = require('@src/config/config')
const { performLdapSearch } = require('@src/helpers/ldapUtils')

const UserServices = () => {
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
      const results = await performLdapSearch(
        baseDN,
        ldapFilter,
        attributes,
        page,
        limit
      )

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
    return results
  }

  return {
    getByUsername,
    handleFilteredSearch,
  }
}

module.exports = UserServices
