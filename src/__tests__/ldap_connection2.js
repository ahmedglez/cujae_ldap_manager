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

const ldap = new LDAP()

ldap.open(options, function (err, client) {
  if (err) {
    console.log('Error: ' + err)
  } else {
    console.log('Connected')
    client.bind(
      'uid=agonzalezb,ou=usuarios,ou=informatica,dc=cujae,dc=edu,dc=cu',
      '00092068426',
      function (err) {
        if (err) {
          console.log('Error: ' + err)
        } else {
          console.log('Binded')
          client.search(
            'dc=cujae,dc=edu,dc=cu',
            { filter: '(uid=agonzalezb)' },
            function (err, res) {
              if (err) {
                console.log('Error: ' + err)
              } else {
                res.on('searchEntry', function (entry) {
                  console.log('entry: ' + JSON.stringify(entry.object))
                })
                res.on('searchReference', function (referral) {
                  console.log('referral: ' + referral.uris.join())
                })
                res.on('error', function (err) {
                  console.log('error: ' + err.message)
                })
                res.on('end', function (result) {
                  console.log('status: ' + result.status)
                  client.unbind(function (err) {
                    if (err) {
                      console.log('Error: ' + err)
                    } else {
                      console.log('Unbinded')
                    }
                  })
                })
              }
            }
          )
        }
      }
    )
  }
})
