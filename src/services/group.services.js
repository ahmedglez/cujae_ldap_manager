const ldap = require('../connections/LDAP_client')
const config = require('../config/config')
const assert = require('assert')
const searchSchema = require('../utils/ldap_search_utils')

ldap.bind(config.ldap.username_bind, config.ldap.password_bind, (err) => {
  assert.ifError(err)
})

const GroupServices = () => {
  const getAll = (group, branch) => {
    const page = undefined
    const dn =
      branch === undefined ? config.ldap.dn : `ou=${branch},${config.ldap.dn}`
    console.log(dn)
    const opts = {
      filter: `(&(objectClass=posixGroup)(cn=${group}))`,
      scope: 'sub',
      attributes: ['cn', 'memberUid'],
      paged: page === undefined ? false : true,
      pageNum: page === undefined ? undefined : parseInt(page),
      sizeLimit: page === undefined ? 500 : undefined,
    }
    console.log(dn)
    console.log(opts)

    return searchSchema(config.ldap.dn, opts)
  }

  return {
    getAll,
  }
}

module.exports = GroupServices
