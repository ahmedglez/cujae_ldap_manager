const {
  client,
  connect,
  isConnected,
  disconnect,
} = require('../connections/redis_client')
const config = require('@src/config/config')
const { performLdapSearch } = require('@src/utils/ldapUtils')

const isBlackListed = async (token) => {
  try {
    await client.connect()

    if (client.isOpen) {
      const userId = await client.get(`blackList:${token}`)
      disconnect()

      // If userId is not null, it means the token exists in the blacklist
      return userId !== null
    } else {
      disconnect()
      throw new Error('Error connecting to redis DB')
    }
  } catch (error) {
    disconnect()
    console.error('Error checking token in blacklist:', error)
    throw error
  }
}

const addToBlackList = async (userId, token) => {
  try {
    await client.connect()
    if (client.isOpen) {
      await client.set(`blackList:${token}`, userId)
      disconnect()
    } else {
      disconnect()
      throw new Error('Error connecting to redis DB')
    }
  } catch (error) {
    disconnect()
    console.error('Error storing refresh token:', error)
  }
}

const storeRefreshToken = async (userId, refreshToken) => {
  try {
    await client.connect()
    if (client.isOpen) {
      await client.set(`refreshToken:${userId}`, refreshToken)
      disconnect()
    } else {
      disconnect()
      throw new Error('Error connecting to redis DB')
    }
  } catch (error) {
    disconnect()
    console.error('Error storing refresh token:', error)
  }
}

const deleteRefreshToken = async (userId) => {
  try {
    await client.connect()
    if (client.isOpen) {
      const data = await client.del(`refreshToken:${userId}`)
      console.log('Refresh token deleted successfully.')
      disconnect()
      return data
    } else {
      disconnect()
      throw new Error('Error connecting to redis DB')
    }
  } catch (error) {
    disconnect()
    console.error('Error deleting refresh token:', error)
    throw error // Re-throw the error to propagate it further if needed
  }
}

const getRefreshToken = async (userId, callback) => {
  try {
    await client.connect()
    const refreshToken = await client.get(`refreshToken:${userId}`)
    disconnect()
    return refreshToken
  } catch (error) {
    disconnect()
    console.error('Error retrieving refresh token:', error)
    callback(error)
  }
}

const isSuperAdmin = async (uid) => {
  const ldapFilter = `(objectClass=posixGroup)`
  const customDN = `cn=admin,${config.ldap.base}`
  try {
    const response = await performLdapSearch(customDN, ldapFilter)
    const adminGroup = response[0]
    return adminGroup.memberUid.includes(uid)
  } catch (error) {
    console.error('Error in isSuperAdmin:', error)
    throw error
  }
}

const isAdmin = async (uid, baseDN = config.ldap.base) => {
  const ldapFilter = `(objectClass=posixGroup)`
  const customDN = `cn=admin,${baseDN.replace('usuarios', 'grupos')}`
  try {
    const response = await performLdapSearch(customDN, ldapFilter)
    const adminGroup = response[0]
    return adminGroup.memberUid.includes(uid)
  } catch (error) {
    console.error('Error in isSuperAdmin:', error)
    throw error
  }
}

module.exports = {
  addToBlackList,
  getRefreshToken,
  storeRefreshToken,
  deleteRefreshToken,
  isBlackListed,
  isSuperAdmin,
  isAdmin,
}
