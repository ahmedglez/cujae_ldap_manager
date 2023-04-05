require('dotenv').config({ path: __dirname + '/../../.env' })
const iesObjectClasses = require('../schemas/ies.schema')

module.exports = {
  server: {
    port: process.env.SERVER_PORT,
    host: process.env.HOST,
  },
  mongodb: {
    url: process.env.MONGODB_URL,
  },
  sessionSecret: process.env.SESSION_SECRET,
  ldap: {
    dn: process.env.LDAP_DN,
    url: process.env.LDAP_URL,
    base: process.env.LDAP_BASE,
    objectClasses: iesObjectClasses,
    port: process.env.LDAP_PORT,
    password: process.env.LDAP_PASS,
    password_bind: process.env.LDAP_PASS_BIND,
    username_bind: process.env.LDAP_USER_BIND,
  },
}
