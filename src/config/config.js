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
  apiKey: process.env.API_KEY,
  ldap: {
    dn: process.env.LDAP_DN,
    url: process.env.LDAP_URL,
    base: process.env.LDAP_BASE,
    objectClasses: iesObjectClasses,
    port: process.env.LDAP_PORT,
    password: process.env.LDAP_PASS,
    password_bind: process.env.LDAP_PASS_BIND,
    username_bind: process.env.LDAP_USER_BIND,
    admin: {
      username: process.env.ADMIN_USER,
      password: process.env.ADMIN_PASS,
    },
    sizeLimit: parseInt(process.env.LDAP_SIZE_LIMIT),
    timeLimit: parseInt(process.env.LDAP_TIME_LIMIT),
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
}
