const boom = require('@hapi/boom')
require('dotenv').config({ path: __dirname + '/../../.env' })
const ldap = require('../connections/LDAP_client')
const LDAP = require('ldapjs')
const config = require('../config/config')
const assert = require('assert')
const searchSchema = require('../utils/ldap_search_utils')

ldap.bind(config.ldap.username_bind, config.ldap.password_bind, (err) => {
  assert.ifError(err)
})

const UserServices = () => {
  const getAll = () => {
    const filter = `(objectclass=*)`
    return searchSchema(filter)
  }

  const getByUsername = (username) => {
    const filter = `(uid=${username})`
    return searchSchema(filter)
  }

  const getByCI = (ci) => {
    const filter = `(ci=${ci})`
    return searchSchema(filter)
  }

  const getByEmail = (email) => {
    const filter = `(maildrop=${email})`
    return searchSchema(filter)
  }

  return {
    getAll,
    getByUsername,
    getByCI,
    getByEmail,
  }
}

module.exports = UserServices
