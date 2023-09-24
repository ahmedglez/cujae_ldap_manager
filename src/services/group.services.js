require('dotenv').config({ path: __dirname + '/../../.env' })
const config = require('../config/config')
const {
  performLdapSearch,
  performScopedLdapSearch,
} = require('@src/utils/ldapUtils')

const GroupServices = () => {
  const getGroup = async (group) => {
    try {
      const baseDN = 'dc=cu'
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

  const getAdminGroup = async (baseDN = config.ldap.base) => {
    const ldapFilter = `(objectClass=*)`
    const dn = `cn=admin,${baseDN}`
    try {
      const results = await performLdapSearch(dn, ldapFilter)
      return results
    } catch (error) {
      console.error('Error in getAdminGroup:', error)
      // Optionally, you can throw the error again to propagate it to the caller
      throw error
    }
  }

  const getGroupByCN = async (baseDN = config.ldap.base, cn = 'admin') => {
    const ldapFilter = `(objectClass=*)`
    const customDN = `cn=${cn},${baseDN}`
    try {
      const results = await performLdapSearch(customDN, ldapFilter)
      return results
    } catch (error) {
      console.error('Error in getGroupByCN:', error)
      throw error
    }
  }

  const getGroupsInBaseDN = async (baseDN = config.ldap.base) => {
    const ldapFilter = `(objectClass=organizationalUnit)`
    try {
      const results = await performLdapSearch(baseDN, ldapFilter)
      return results
    } catch (error) {
      console.error('Error in getGroupByCN:', error)
      throw error
    }
  }

  const getChildrensBaseDN = async (baseDN = config.ldap.base) => {
    const ldapFilter = `(objectClass=*)`
    try {
      const results = await performScopedLdapSearch(baseDN, ldapFilter)
      return results
    } catch (error) {
      console.error('Error in getChildrens', error)
      throw error
    }
  }

  return {
    getAdminGroup,
    getGroup,
    getGroupByCN,
    getGroupsInBaseDN,
    getChildrensBaseDN,
  }
}

module.exports = GroupServices
