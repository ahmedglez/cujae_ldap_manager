const config = require('@src/config/config')
const { performBaseLdapSearch } = require('@src/utils/ldapUtils')

const searchByDN = async (dn = '') => {
  const ldapFilter = `(objectClass=*)`
  try {
    const results = await performBaseLdapSearch(dn, ldapFilter)
    return results
  } catch (error) {
    console.error('Error in getChildrens', error)
    throw error
  }
}
module.exports = {
  searchByDN,
}
