require('dotenv').config({ path: __dirname + '/../../.env' })
const config = require('@src/config/config')
const {
  performLdapSearch,
  performLdapUpdate,
  performLdapAddition,
} = require('@src/utils/ldapUtils')
const Joi = require('joi')
const ldapEntrySchema = Joi.object({
  CI: Joi.string().required(),
  middleName: Joi.string().required(),
  lastName: Joi.string().required(),
  name: Joi.string().required(),
  homeAddress: Joi.string().required(),
  telephoneNumber: Joi.string().required(),
  dayRegister: Joi.date().iso().required(),
  sex: Joi.string().valid('M', 'F').required(),
  area: Joi.string().allow(null).required(),
  userCondition: Joi.string().required(),
  userStatus: Joi.string().required(),
  sedeMunicipio: Joi.string().required(),
  userType: Joi.string().required(),
  userInformation: Joi.string().required(),
  career: Joi.string().required(),
  studentClassGroup: Joi.string().required(),
  studentYear: Joi.string().required(),
  country: Joi.string().required(),
  UJC: Joi.string().required(),
  skinColor: Joi.string().required(),
  nameInstitution: Joi.string().required(),
  right: Joi.string().required(),
  hash: Joi.string().required(),
  lastTimeChange: Joi.string().required(),
  uid: Joi.string().required(),
  homeDirectory: Joi.string().required(),
  givenName: Joi.string().required(),
  cn: Joi.string().required(),
  sn: Joi.string().required(),
  displayName: Joi.string().required(),
  uidNumber: Joi.string().required(),
  userPassword: Joi.string().required(),
  mail: Joi.array().items(Joi.string()).required(),
  maildrop: Joi.array().items(Joi.string()).required(),
  gidNumber: Joi.string().required(),
  sambaSID: Joi.string().required(),
  objectClass: Joi.array().items(Joi.string()).required(),
})

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

      const { error, value } = ldapEntrySchema.validate(newUser)

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
