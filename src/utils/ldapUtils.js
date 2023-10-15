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
  return new Promise((resolve, reject) => {
    try {
      bindLdapClient() // Bind before search

      /*  const entry = {
        CI: '85100804881',
        middleName: 'Lorenzo',
        lastName: 'Neyra',
        name: 'Javier',
        homeAddress: 'Ave. 31 B # 4208',
        telephoneNumber: '(7) 202-73-19',
        dayRegister: '2019-10-19',
        sex: 'M',
        area: 'null',
        userCondition: 'Externo',
        userStatus: 'Activo',
        sedeMunicipio: 'PLAYA',
        userType: 'Estudiante',
        userInformation: 'Curso por Encuentros',
        career: 'Ingeniería Informática',
        studentClassGroup: '23',
        studentYear: '2',
        country: 'Cuba',
        UJC: 'no',
        skinColor: 'Blanco',
        nameInstitution: 'Filial 10 de Octubre',
        right: 'Todos',
        hash: '44dacf000071e4b68d826bc96ff9909d4b8e25e1',
        lastTimeChange: '13-Jul-2023-19:21:41',
        uid: 'tommy.test',
        homeDirectory: '/home/tommy.test',
        givenName: 'tommy.test',
        cn: 'Tommy',
        sn: 'Lorenzo Neyra',
        displayName: 'Javier',
        uidNumber: '1000',
        userPassword: '{SHA}qlPBpNoITztMtAoTi+qrhqSXK+88',
        mail: ['tommy.test@cujae.edu.cu'],
        maildrop: ['tommy.test@cujae.edu.cu'],
        gidNumber: '1000842',
        sambaSID: 'sambaSID',
        objectClass: [
          'top',
          'person',
          'posixAccount',
          'shadowAccount',
          'inetOrgPerson',
          'iesServices',
          'sambaSamAccount',
          'radiusprofile',
          'CourierMailAlias',
          'iesMember',
        ],
      } */

      ldapClient.add(dn, entry, (err) => {
        if (err) {
          console.log('error', err)
          assert.ifError(err)
        } else {
          console.log('created user')
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
}
