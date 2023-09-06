const ldapClient = require('../LDAP_client')
const config = require('../../config/config.js')

describe('LDAP Connection', () => {
  // This test case will check if the LDAP client is connected successfully
  it('should connect to LDAP', (done) => {
    ldapClient.on('connect', () => {
      console.log('Connected to LDAP')
      done()
    })

    ldapClient.on('error', (err) => {
      done.fail(`Failed to connect to LDAP: ${err}`)
    })
  })
})
