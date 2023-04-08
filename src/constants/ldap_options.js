const config = require('../config/config')

// new mode, simple user
let usernameAttr = 'uid'
let searchBase = config.ldap.dn
let admOptions = {
  ldapOpts: {
    url: config.ldap.url,
    //tlsOptions: { rejectUnauthorized: false }
  },
  adminDn: `cn=read-only-admin,dc=example,dc=com`,
  adminPassword: 'password',
  userSearchBase: searchBase,
  usernameAttribute: usernameAttr,
  //starttls: true
}
let userOptions = {
  ldapOpts: {
    url: config.ldap.url,
    //tlsOptions: { rejectUnauthorized: false }
  },
  userDn: `uid={{username}},ou=usuarios,ou={{branch}},${config.ldap.dn}`,
  userSearchBase: searchBase,
  usernameAttribute: usernameAttr,
  //starttls: true
}


module.exports = {usernameAttr, searchBase, admOptions, userOptions}