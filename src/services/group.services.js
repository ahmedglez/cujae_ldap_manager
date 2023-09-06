require('dotenv').config({ path: __dirname + '/../../.env' })
const config = require('@src/config/config')
const { performLdapSearch } = require('@src/utils/ldapUtils')

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
}

module.exports = GroupServices
