const {
  client,
  connect,
  isConnected,
  disconnect,
} = require('../connections/redis_client')

const addToBlackList = async (token, expirationInSeconds = 3600) => {
  try {
    await client.connect()
    if (client.isOpen) {
      const exists = await client.exists(token)
      if (exists > 0) {
        disconnect()
        return false
      }
      client.hSet(token, expirationInSeconds, '1')
      disconnect()
      return true
    } else {
      disconnect()
      throw new Error('Error connecting to redis DB')
    }
  } catch (err) {
    disconnect()
    console.log('error', err)
    throw new Error('Error connecting to redis DB')
  }
}

const isBlackListed = async (token) => {
  console.log('token', token)
  try {
    await client.connect()
    if (client.isOpen) {
      const exists = await client.exists(token)
      console.log('exists', exists)
      disconnect()
      if (exists === 0) return false
      else return true
    } else {
      disconnect()
      throw new Error('Error connecting to redis DB')
    }
  } catch (error) {
    disconnect()
    console.log('error', err)
    throw new Error('Error connecting to redis DB')
  }
}

module.exports = {
  addToBlackList,
  isBlackListed,
}
