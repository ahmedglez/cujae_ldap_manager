const config = require('../config/config')
const transformData = require('./transform_user_schema')
const ldap = require('../connections/LDAP_client')

const searchSchema = (filter, customDN) => {
  const dn =
    customDN !== null && customDN !== undefined ? customDN : config.ldap.dn
  const attributes = ['uid', 'displayName', 'CI']
  const search_options = {
    scope: 'sub',
    filter: filter,
    attrs: attributes,
  }

  const results = []

  return new Promise((resolve, reject) => {
    ldap.search(dn, search_options, (err, res) => {
      if (err) {
        return reject(new Error(`Search failed: ${err.message}`))
      }
      return res
        .on('searchEntry', (entry) =>
          results.push({
            objectName: entry.pojo.objectName,
            attributes: transformData(entry),
          })
        )
        .once('error', (resError) =>
          reject(new Error(`Search error: ${resError}`))
        )
        .on('end', (result) => {
          console.log('status: ' + result.status)
        })
        .once('end', () => resolve(results[0]))
    })
  })
}

module.exports = searchSchema
