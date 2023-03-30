require('dotenv').config({ path: __dirname + '/../../.env' })

module.exports = {
  server: {
    port: process.env.PORT,
    host: process.env.HOST,
  },
  mongodb: {
    url: process.env.MONGODB_URL,
  },
  sessionSecret: process.env.SESSION_SECRET,
  ldap: {
    dn: process.env.LDAP_DN,
    url: process.env.LDAP_URL,
  },
}
