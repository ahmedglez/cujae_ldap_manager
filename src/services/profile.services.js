const boom = require('@hapi/boom')
require('dotenv').config({ path: __dirname + '/../../.env' })
const ldapClient = require('../connections/LDAP_client')
const UserServices = require('./user.services')
const service = UserServices()
const { verifyToken } = require('../utils/authentication/tokens/token_verify')
const ldap = require('ldapjs')
const { User } = require('../schemas/user.schema')

const ProfileServices = () => {
  const getProfile = (req) => {
    try {
      const token = req.headers.authorization.split(' ')[1]
      const payload = verifyToken(token)
      const { sub } = payload
      return service.getByUsername(sub)
    } catch (error) {
      throw new Error('Invalid token')
      return null
    }
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

  async function getLastLoginByUsername(username) {
    try {
      const user = await User.findOne({ username })
        .sort({ updatedAt: -1 })
        .exec()

      if (!user) {
        return 'User not found'
      }

      return user.updatedAt
    } catch (error) {
      console.error('Error fetching last login:', error)
      return null
    }
  }

  async function updateLastTimeLogged(username) {
    try {
      const currentDate = new Date()

      const updatedUser = await User.findOneAndUpdate(
        { username },
        {
          updatedAt: currentDate,
          $push: {
            registry: {
              timestamp: currentDate,
            },
          }, // Add new login record
        },
        { new: true } // Return the updated document
      ).exec()

      if (!updatedUser) {
        return 'User not found'
      }

      // Ensure that loginRecords is an array (initialize if needed)
      if (!Array.isArray(updatedUser.loginRecords)) {
        updatedUser.loginRecords = []
      }

      const lastLoginDate = updatedUser.updatedAt.toLocaleString()
      return lastLoginDate
    } catch (error) {
      console.error('Error updating last login:', error)
      return null
    }
  }

  return {
    getProfile,
    updateProfile,
    getLastLoginByUsername,
    updateLastTimeLogged,
  }
}

module.exports = ProfileServices
