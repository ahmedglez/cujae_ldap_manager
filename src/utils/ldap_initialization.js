const LdapAuth = require('./../modules/authentication/LdapAuth')
const { usernameAttr, userOptions } = require('./../constants/ldap_options')
const User = require('../schemas/user.schema').User

const ldap_initialization = (app) => {
  try {
    // LDAP initialization
    LdapAuth.initialize(userOptions, app, async (id) => {
      try {
        const user = await User.findOne({ username: id }).exec()
        if (!user) {
          throw new Error('User not found in the database')
        }
        console.log(`${user[usernameAttr]} has logged in`)
        let foundUser = await User.findOneAndUpdate(
          { username: user[usernameAttr] },
          user,
          {
            upsert: true,
            new: true,
          }
        ).exec()
        if (!foundUser) {
          throw new Error('Failed to update/retrieve user from the database')
        }
        console.log(`${foundUser.username} is retrieved from the database`)
        return foundUser
      } catch (error) {
        console.error(
          'Error while querying/updating user in the database:',
          error.message
        )
        throw error // Re-throw the error to be caught by the outer catch block
      }
    })
  } catch (error) {
    console.error('Error during LDAP initialization:', error.message)
  }
}

module.exports = ldap_initialization
