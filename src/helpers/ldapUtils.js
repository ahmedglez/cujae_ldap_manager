const ldapClient = require('@src/connections/LDAP_client')
const config = require('@src/config/config')

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

  return data
}

// Perform a search using the provided filter and return the results
const performLdapSearch = async (baseDn, filter, attributes) => {
  await bindLdapClient() // Bind before search

  const searchOptions = {
    filter: filter,
    scope: 'sub',
    attributes,
  }

  return new Promise((resolve, reject) => {
    const searchResults = []

    ldapClient.search(baseDn, searchOptions, (err, searchResponse) => {
      if (err) {
        reject(err)
        return
      }

      searchResponse.on('searchEntry', (entry) => {
        searchResults.push(transform(entry))
      })

      searchResponse.on('end', () => {
        resolve(searchResults)
      })
    })
  })
}

module.exports = {
  performLdapSearch,
  unbindLdapClient,
}
