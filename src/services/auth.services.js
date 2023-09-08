const {
  client,
  connect,
  isConnected,
  disconnect,
} = require('../connections/redis_client')

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
      client.set(`refreshToken:${userId}`, refreshToken, (err) => {
        if (err) {
          disconnect()
          console.error('Error storing refresh token:', err)
        } else {
          disconnect()
          console.log('Refresh token stored successfully.')
        }
      })
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

    client.get(`refreshToken:${userId}`, (err, refreshToken) => {
      if (err) {
        disconnect()
        console.error('Error retrieving refresh token:', err)
        callback(err)
      } else {
        disconnect()
        console.log('Refresh token retrieved successfully.')
        callback(null, refreshToken)
      }
    })
  } catch (error) {
    disconnect()
    console.error('Error retrieving refresh token:', error)
    callback(error)
  }
}

module.exports = {
  addToBlackList,
  getRefreshToken,
  storeRefreshToken,
  deleteRefreshToken,
  isBlackListed,
}
