require('dotenv').config({ path: __dirname + '/../../.env' })
const config = require('@src/config/config')
const { performLdapSearch, performLdapUpdate } = require('@src/utils/ldapUtils')

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
      `(uid=${username})`,
      null
    )
    return results[0]
  }

  const getByEmail = async (email) => {
    const results = await performLdapSearch(
      config.ldap.base,
      `(maildrop=${email})`,
      null
    )
    return results[0]
  }

  const updateUser = async (username, att, value) => {
    const results = await performLdapSearch(
      config.ldap.base,
      `(uid=${username})`,
      []
    )
    const user = results[0]

    const updatedUser = await performLdapUpdate(user.dn, att, value)
    return updatedUser
  }

  return {
    getByUsername,
    handleFilteredSearch,
    updateUser,
    getByEmail,
  }
}

module.exports = UserServices
