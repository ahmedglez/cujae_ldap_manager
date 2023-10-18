require('dotenv').config({ path: __dirname + '/../../.env' })
const config = require('@src/config/config')
const {
  performLdapSearch,
  performLdapUpdate,
  performLdapAddition,
} = require('@src/utils/ldapUtils')
const {
  ldapEntrySchema,
  studentSchema,
  employeeSchema,
} = require('@src/schemas/ldapEntry.schema')
const { userTypes } = require('@src/constants/userTypes')
const { objectClasses } = require('@src/constants/user_objectClasses')

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

  const addUser = async (dn, newUser) => {
    try {
      // Input validation
      if (!dn || !newUser) {
        throw new Error('Missing required parameters.')
      }

      if (!userTypes.includes(newUser.userType)) {
        throw new Error(`Invalid userType`)
      }

      const { error, value } = ldapEntrySchema.validate(newUser)

      if (newUser.userType === userTypes)
        if (error) {
          throw new Error(`Validation failed: ${error.details[0].message}`)
        }

      // Check if the user already exists
      const alreadyExistingUser = await handleFilteredSearch(
        config.ldap.base,
        `(|(uid=${newUser.uid})(CI=${newUser.CI})(email=${newUser.email}))`
      )

      if (!!alreadyExistingUser && alreadyExistingUser.length !== 0) {
        throw new Error(`User already exists with the given DN.`)
      }

      /* Add necessary atts */
      newUser.objectclass = objectClasses
      newUser.homeDirectory = `/home/${newUser.uid}`

      // Perform LDAP addition
      const addedUser = await performLdapAddition(dn, newUser)

      return addedUser
    } catch (error) {
      console.error('Error in addUser:', error)
      throw error
    }
  }

  return {
    getByUsername,
    handleFilteredSearch,
    updateUser,
    getByEmail,
    addUser,
  }
}

module.exports = UserServices
