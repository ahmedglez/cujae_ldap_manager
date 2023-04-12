const config = require('../config/config')
const transformData = require('./transform_user_schema')
const ldap = require('../connections/LDAP_client')

const searchSchema = (dn, opt) => {
  let results = []
  let pageCount = 0

  return new Promise((resolve, reject) => {
    ldap.search(dn, opt, (err, res) => {
      res.on('searchEntry', (entry) => {
        if (opt.sizeLimit !== undefined) {
          if (results.length === opt.sizeLimit - 1) {
            resolve(results.length === 1 ? results[0] : results)
          }
        }
        results.push({
          objectName: entry.pojo.objectName,
          attributes: transformData(entry),
        })
      })
      res.on('page', (result, cb) => {
        console.log('page finish')
        pageCount = pageCount + 1
        resolve(results.length === 1 ? results[0] : results)
      })
      res.on('searchReference', (referral) => {
        console.log('referral: ' + referral.uris.join())
      })
      res.on('error', (resError) =>
        reject(new Error(`Search error: ${resError}`))
      )
      res.on('end', (result) => {
        console.log('status: ' + result.status)
        console.log('RESULTS', results.length)
        resolve(results.length === 1 ? results[0] : results)
      })
    })
  })
}

module.exports = searchSchema
