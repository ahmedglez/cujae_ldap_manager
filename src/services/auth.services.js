const {
  client,
  connect,
  isConnected,
  disconnect,
} = require('../connections/redis_client')

const addToBlackList = async (token, expirationInSeconds) => {
  try {
    await connect()
    if (isConnected) {
      client.hSet(token, expirationInSeconds, '1')
    } else {
      throw new Error('Error connecting to redis DB')
    }
  } catch (error) {}
}

module.exports = {
  addToBlackList,
}
