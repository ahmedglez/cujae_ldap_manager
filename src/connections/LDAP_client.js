const ldap = require('ldapjs')
const config = require('../config/config')
var assert = require('assert')

const client = ldap.createClient({
  url: [`${config.ldap.url}:${config.ldap.port}`],
  connectTimeout: 60000,
  reconnect: true,
})

client.on('connectError', (err) => {
  console.log('Error trying to connect to LDAP', err)
})

client.bind(config.ldap.admin.username, config.ldap.admin.password, (err) => {
  assert.ifError(err)
})

module.exports = client
