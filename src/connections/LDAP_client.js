const ldap = require('ldapjs')
const config = require('../config/config')
const assert = require('assert')

try {
  const client = ldap.createClient({
    url: [`${config.ldap.url}:${config.ldap.port}`],
    connectTimeout: 60000,
    reconnect: true,
  })

  client.on('connectError', (err) => {
    console.log('Error trying to connect to LDAP', err)
  })

  client.on('error', (err) => {
    console.error('LDAP Error:', err.message)
  })

  client.on('end', (result) => {
    console.log('LDAP Result:', result.status)
  })

  client.bind(config.ldap.admin.username, config.ldap.admin.password, (err) => {
    try {
      if (err) {
        console.error('Error binding to LDAP:', err)
        // Handle the error gracefully here, e.g., log it or perform other actions
      } else {
        console.log('Binded to LDAP')
      }
    } catch (bindError) {
      console.error('Error during LDAP binding:', bindError)
      // Handle the binding error gracefully here
    }
  })

  module.exports = client
} catch (clientError) {
  console.error('Error creating LDAP client:', clientError)
  // Handle the LDAP client creation error gracefully here
}
