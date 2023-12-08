const ldap = require('ldapjs')
const ldapClient = require('@src/connections/LDAP_client')
const config = require('@src/config/config')
var assert = require('assert')

const ADMIN_USER = process.env.ADMIN_USER || 'cn=admin,dc=cu'
const ADMIN_PASS = process.env.ADMIN_PASS || ''

// Bind to the LDAP server using appropriate credentials
const bindLdapClient = () => {
  return new Promise((resolve, reject) => {
    ldapClient.bind(ADMIN_USER, ADMIN_PASS, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

// Unbind the LDAP client to release resources
const unbindLdapClient = () => {
  ldapClient.unbind()
}

const getObject = (arr) => {
  const newObj = {}
  arr.forEach((obj) => {
    if (obj.type === 'mail' || obj.type === 'maildrop') {
      newObj[obj.type] = obj.values
    } else {
      newObj[obj.type] = obj.values.length === 1 ? obj.values[0] : obj.values
    }
  })
  return newObj
}

const transform = (entry) => {
  const data = getObject(entry.pojo.attributes)
  data.objectName = entry.pojo.objectName
  data.dn = entry.pojo.objectName
  return data
}

function generateUniqueUID() {
  // Generate a random 4-digit number
  const randomPart = Math.floor(1000 + Math.random() * 9000)

  return `${randomPart}`
}

// Perform a search using the provided filter and return the results
const performLdapSearch = async (baseDn, filter, attributes) => {
  return new Promise((resolve, reject) => {
    try {
      bindLdapClient() // Bind before search

      const searchOptions = {
        filter: filter,
        scope: 'sub',
        attributes,
        timeLimit: config.ldap.timeLimit,
      }

      const searchResults = []

      ldapClient.search(baseDn, searchOptions, (err, searchResponse) => {
        if (err) {
          reject(err)
          return // Exit the function early in case of error
        }

        searchResponse.on('searchEntry', (entry) => {
          searchResults.push(transform(entry))
        })

        searchResponse.on('end', () => {
          resolve(searchResults)
        })
        searchResponse.on('error', (error) => {
          reject(error)
        })
      })
    } catch (err) {
      reject(err)
    }
  })
}

const performScopedLdapSearch = async (baseDn, filter, attributes) => {
  console.log('baseDN', baseDn)
  return new Promise((resolve, reject) => {
    try {
      bindLdapClient() // Bind before search

      const searchOptions = {
        filter: filter,
        scope: 'one',
        attributes,
        timeLimit: config.ldap.timeLimit,
      }

      const searchResults = []

      ldapClient.search(baseDn, searchOptions, (err, searchResponse) => {
        if (err) {
          reject(err)
          return // Exit the function early in case of error
        }

        searchResponse.on('searchEntry', (entry) => {
          searchResults.push(transform(entry))
        })

        searchResponse.on('end', () => {
          resolve(searchResults)
        })

        searchResponse.on('error', (error) => {
          reject(error)
        })
      })
    } catch (error) {
      reject(error)
    }
  })
}

const performBaseLdapSearch = async (baseDn, filter, attributes) => {
  return new Promise((resolve, reject) => {
    try {
      bindLdapClient() // Bind before search

      const searchOptions = {
        filter: filter,
        scope: 'base',
        attributes,
        timeLimit: config.ldap.timeLimit,
      }

      const searchResults = []

      ldapClient.search(baseDn, searchOptions, (err, searchResponse) => {
        if (err) {
          reject(err)
          return // Exit the function early in case of error
        }

        searchResponse.on('searchEntry', (entry) => {
          searchResults.push(transform(entry))
        })

        searchResponse.on('end', () => {
          resolve(searchResults)
        })
        searchResponse.on('error', (error) => {
          reject(error)
        })
      })
    } catch (err) {
      reject(err)
    }
  })
}

const performLdapUpdate = async (userDN, att, value) => {
  return new Promise((resolve, reject) => {
    try {
      bindLdapClient() // Bind before search

      const change = new ldap.Change({
        operation: 'replace',
        modification: {
          type: att,
          values: [value],
        },
      })

      ldapClient.modify(userDN, change, (err) => {
        if (err) {
          console.log('error', err)
          assert.ifError(err)
        } else {
          console.log('updated user')
          resolve('updated User')
        }
      })
    } catch (err) {
      reject(err)
    }
  })
}

const performLdapAddition = async (dn, entry) => {
  entry.uidNumber = generateUniqueUID()
  entry.gidNumber = '1000'
  entry.right = 'Todos'
  entry.lastTimeChange = new Date().toISOString()
  entry.sambaSID = 'S-1-5-21-1255719363-1350762778-3568053751-513'

  return new Promise((resolve, reject) => {
    try {
      bindLdapClient() // Bind before search

      ldapClient.add(dn, entry, (err) => {
        if (err) {
          console.log('error', err)
          reject({
            success: true,
            message: err,
          })
        } else {
          resolve('created User')
        }
      })
    } catch (err) {
      reject(err)
    }
  })
}

module.exports = {
  performLdapSearch,
  unbindLdapClient,
  performLdapUpdate,
  performScopedLdapSearch,
  performBaseLdapSearch,
  performLdapAddition,
  generateUniqueUID,
}
