const ldap = require('ldapjs')
const ldapClient = require('@src/connections/LDAP_client')
const config = require('@src/config/config')
var assert = require('assert')

// Bind to the LDAP server using appropriate credentials
const bindLdapClient = () => {
  return new Promise((resolve, reject) => {
    ldapClient.bind(
      config.ldap.admin.username,
      config.ldap.admin.password,
      (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      }
    )
  })
}

// Unbind the LDAP client to release resources
const unbindLdapClient = () => {
  ldapClient.unbind()
}

const getObject = (arr) => {
  const newObj = {}
  arr.forEach((obj) => {
    newObj[obj.type] = obj.values.length === 1 ? obj.values[0] : obj.values
  })
  return newObj
}

const transform = (entry) => {
  const data = getObject(entry.pojo.attributes)
  data.objectName = entry.pojo.objectName
  data.dn = entry.pojo.objectName
  return data
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
      })
    } catch (err) {
      reject(err)
    }
  })
}

const performScopedLdapSearch = async (baseDn, filter, attributes) => {
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
      })
    } catch (err) {
      reject(err)
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
      })
    } catch (err) {
      reject(err)
    }
  })
}

const performLdapUpdate = async (userDN, att, value) => {
  console.log('userDN', userDN)
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

module.exports = {
  performLdapSearch,
  unbindLdapClient,
  performLdapUpdate,
  performScopedLdapSearch,
  performBaseLdapSearch,
}
