const ldap = require('ldapjs')
const config = require('../config/config')
var assert = require('assert')

const client = ldap.createClient({
  url: [`${config.ldap.url}:${config.ldap.port}`],
  connectTimeout: 60000,
  reconnect: true,
})

client.on('connectError', (err) => {
  assert.ifError(err)
})

client.on('connection', (stream) => {
  console.log('someone connected!')
})

client.bind(config.ldap.username_bind, config.ldap.password_bind, (err) => {
  assert.ifError(err)
})

module.exports = client
