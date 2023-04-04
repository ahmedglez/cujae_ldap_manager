const LDAP = require('LDAP')

var options = {
  uri: 'ldap://10.8.176.9', // string
  version: 3, // integer, default is 3,
  starttls: false, // boolean, default is false
  connecttimeout: -1, // seconds, default is -1 (infinite timeout), connect timeout
  timeout: 5000, // milliseconds, default is 5000 (infinite timeout is unsupported), operation timeout
  reconnect: true, // boolean, default is true,
  backoffmax: 32, // seconds, default is 32, reconnect timeout
}

const ldap = new LDAP(options)

ldap.open(function (err) {
  if (err) {
    console.log('Can not connect')
    throw new Error('Can not connect')
  }
  // connection is ready.
})

ldap.simplebind(bind_options, function (err) {
  console.log('Cannot simplebind: ', err)
  throw new Error('Cannot simplebind')
})

module.exports = ldap
