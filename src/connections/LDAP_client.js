const ldap = require('ldapjs')
const config = require('../config/config')
var assert = require('assert')
const { promisify } = require('util')

const client = ldap.createClient({
  url: [`${config.ldap.url}:${config.ldap.port}`],
  connectTimeout: 60000,
})

client.on('connectError', (err) => {
  assert.ifError(err)
})

client.bind(config.ldap.username_bind, config.ldap.password_bind, (err) => {
  assert.ifError(err)
})

module.exports = client
