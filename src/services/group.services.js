const boom = require('@hapi/boom')
const ldap = require('../connections/LDAP_client')
const LDAP = require('ldapjs')
const config = require('../config/config')
const assert = require('assert')

ldap.bind(
  'uid=agonzalezb,ou=usuarios,ou=informatica,dc=cujae,dc=edu,dc=cu',
  '00092068426',
  (err) => {
    assert.ifError(err)
  }
)

const STUDENT_CLASS = config.ldap.objectClasses[3].name

const GroupServices = () => {
  const searchAtt = (atts, value) => {
    let values = {}
    atts.map((att) => {
      if (att.type === value) {
        values = att.values
      }
    })
    return values[0]
  }

  const getAll = (group) => {
    const filter = `(studentClassGroup=${group})`
    const attributes = ['uid', 'displayName', 'CI']
    const search_options = {
      scope: 'sub',
      filter: filter,
      attrs: attributes,
    }

    const results = []

    const promise = new Promise((resolve, reject) => {
      ldap.search(config.ldap.dn, search_options, (err, res) => {
        if (err) {
          return reject(new Error(`Search failed: ${err.message}`))
        }
        return res
          .on('searchEntry', (entry) =>
            results.push({
              objectName: entry.pojo.objectName,
              attributes: {
                uid: searchAtt(entry.pojo.attributes, 'uid'),
                givenName: searchAtt(entry.pojo.attributes, 'givenName'),
                cn: searchAtt(entry.pojo.attributes, 'cn'),
                sn: searchAtt(entry.pojo.attributes, 'sn'),
                ci: searchAtt(entry.pojo.attributes, 'CI'),
                area: searchAtt(entry.pojo.attributes, 'area'),
                displayName: searchAtt(entry.pojo.attributes, 'displayName'),
                maildrop: searchAtt(entry.pojo.attributes, 'maildrop'),
                email: searchAtt(entry.pojo.attributes, 'email'),
                mailService: searchAtt(entry.pojo.attributes, 'mailService'),
                type: searchAtt(entry.pojo.attributes, 'type'),
              },
            })
          )
          .once('error', (resError) =>
            reject(new Error(`Search error: ${resError}`))
          )
          .on('end', (result) => {
            console.log('status: ' + result.status)
          })
          .once('end', () => resolve(results))
      })
    })

    return promise
  }

  return {
    getAll,
  }
}

module.exports = GroupServices
