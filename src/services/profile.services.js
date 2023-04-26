const boom = require('@hapi/boom')
require('dotenv').config({ path: __dirname + '/../../.env' })
const ldapClient = require('../connections/LDAP_client')
const UserServices = require('./user.services')
const service = UserServices()
const { verifyToken } = require('../utils/authentication/tokens/token_verify')
const ldap = require('ldapjs')

const ProfileServices = () => {
  const getProfile = (req) => {
    const token = req.headers.authorization.split(' ')[1]
    const payload = verifyToken(token)
    const { sub } = payload
    return service.getByUsername(sub)
  }

  const updateProfile = async (email, password, req) => {
    const token = req.headers.authorization.split(' ')[1]
    const payload = verifyToken(token)
    const { dn, sub } = payload

    const user = await service.getByUsername(sub)
    if (user.dn !== dn) {
      return boom.unauthorized('Unauthorized')
    } else {
      const change = new ldap.Change({
        operation: 'replace',
        modification: new ldap.Attribute(
          {
            type: 'maildrop',
            value: [`=${email}`],
          },
          {
            type: 'password',
            value: [`=${password}`],
          }
        ),
      })

      return ldapClient.modify(dn, change, (err) => {
        boom.badImplementation(err)
      })
    }
  }

  return {
    getProfile,
    updateProfile,
  }
}

module.exports = ProfileServices
