const { createClient } = require('redis')
const { promisify } = require('util')

// Function to create and configure a Redis client
function createRedisClient() {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
  const client = createClient({
    url: redisUrl,
  })

  // Promisify Redis client methods for async/await support
  const getAsync = promisify(client.get).bind(client)
  const setAsync = promisify(client.set).bind(client)

  // Connect to Redis
  async function connect() {
    return new Promise((resolve, reject) => {
      client.on('error', (err) => {
        reject(err)
      })

      client.on('connect', () => {
        resolve()
      })
    })
  }

  // Close the Redis client to release resources
  function disconnect() {
    client.quit()
  }

  // Return the Redis client and utility functions
  return {
    client,
    connect,
    disconnect,
    isConnected: client.isOpen,
    getAsync,
    setAsync,
  }
}

module.exports = createRedisClient()
