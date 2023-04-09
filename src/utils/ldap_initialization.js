const LdapAuth = require('./../modules/authentication/LdapAuth')
const { usernameAttr, userOptions } = require('./../constants/ldap_options')
const User = require('../schemas/user.schema').User

const ldap_initialization = (app) => {
  //LDAP initialization
  LdapAuth.initialize(
    userOptions,
    app,
    (id) => User.findOne({ username: id }).exec(),
    async (user) => {
      console.log(`${user[usernameAttr]} has logged in`)
      let foundUser = await User.findOneAndUpdate(
        { username: user[usernameAttr] },
        user,
        {
          upsert: true,
          new: true,
        }
      ).exec()
      console.log(`${foundUser.username} is retrieved from database`)
      return foundUser
    }
  )
}

module.exports = ldap_initialization
