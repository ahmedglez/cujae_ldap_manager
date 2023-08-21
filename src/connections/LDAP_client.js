const ldap = require('ldapjs')
const config = require('../config/config')
var assert = require('assert')

const initializeLDAPConnection = () => {
  try {
    const client = ldap.createClient({
      url: [`${config.ldap.url}:${config.ldap.port}`],
      connectTimeout: 60000,
      reconnect: true,
    })

    client.on('connectError', (err) => {
      console.log('LDAP Connection Error:', err.message)
    })

    client.bind(
      config.ldap.admin.username,
      config.ldap.admin.password,
      (err) => {
        if (err) {
          console.error('LDAP Bind Error:', err.message)
        } else {
          console.log('LDAP Connection Successful')
        }
      }
    )

    return client
  } catch (error) {
    console.error('Error initializing LDAP connection:', error.message)
    return null // Return null or a default client if the connection setup fails
  }
}

module.exports = initializeLDAPConnection
