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
  return falsef
}

module.exports = {
  addToBlackList,
}
