const request = require('supertest')
const app = require('../../server') // your Express app
const UserServices = require('../services/user.services')
const mongoose = require('mongoose')
const User = require('../schemas/user.schema').User
const config = require('../config/config')
const ldapClient = require('../connections/LDAP_client')

describe('Prueba de Integración: Verifique que el servidor pueda comunicarse correctamente con la base de datos y el servidor LDAP', () => {
  it('should correctly communicate with the database and the LDAP server', async () => {
    // Get all users from the 'users' collection in the 'ldapDB' database
    const users = await User.find({})

    for (const user of users) {
      // For each user, check if their 'username' attribute matches a 'uid' in the LDAP server
      const searchOptions = {
        filter: `(uid=${user.username})`,
        scope: 'sub',
      }

      await new Promise((resolve, reject) => {
        ldapClient.search(config.ldap.dn, searchOptions, (err, res) => {
          if (err) return reject(err)

          res.on('searchEntry', (entry) => {
            const uid = entry.pojo.attributes[0].values[0]
            expect(uid).toBe(user.username)
          })

          res.on('end', resolve)
        })
      })
    }
  })
})
