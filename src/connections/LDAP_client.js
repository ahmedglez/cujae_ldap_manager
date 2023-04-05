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

client.bind(
  'uid=agonzalezb,ou=usuarios,ou=informatica,dc=cujae,dc=edu,dc=cu',
  '00092068426',
  (err) => {
    assert.ifError(err)
  }
)

module.exports = client
