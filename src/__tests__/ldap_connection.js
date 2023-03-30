import SimpleLDAP from 'simple-ldap-search'

const config = {
  url: 'ldap://10.8.176.9',
  base: 'dc=cujae,dc=edu,dc=cu',
  dn: 'uid=agonzalezb,ou=usuarios,ou=informatica,dc=cujae,dc=edu,dc=cu',
  password: '00092068426',
  // optionally pass tls options to ldapjs
  tlsOptions: {
    // tls options ...
  },
}

// create a new client
const ldap = new SimpleLDAP(config)
ldap.bindDN()

// setup a filter and attributes for your LDAP query
const filter = '(objectclass=iesEducationalStaff)'
const attributes = ['uid', 'displayName', 'CI']

// using async/await
const getUsers = async () => {
  console.log('filters: ', filter)
  console.log('atts: ', attributes)
  ldap
    .search(filter,attributes)
    .then((res) => {
      console.log('Response', res)
    })
    .catch((err) => console.log('ERROR EN RESPONSE', err))
}
getUsers()
// [{
//   dn: 'uid=artvandelay, dc=users, dc=localhost',
//   idNumber: 1234567,
//   uid: 'artvandelay',
//   givenName: 'Art',
//   sn: 'Vandelay',
//   telephoneNumber: '555-123-4567',
// }]
