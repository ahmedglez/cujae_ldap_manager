const redis = require('redis')
const config = require('@src/config/config')

// Create a Redis client
const client = redis.createClient({
  host: config.redis.host, // Docker Desktop container runs on localhost
  port: parseInt(config.redis.port), // Default Redis port
})

// Test the connection
client.on('connect', () => {
  console.log('Connected to Redis server')
})

// Handle errors
client.on('error', (err) => {
  console.error('Redis Error:', err)
})

// Example: Set a key-value pair
/* client.set('myKey', 'myValue', (err, reply) => {
  if (err) {
    console.error('Redis Set Error:', err)
  } else {
    console.log('Set result:', reply)
  }
})

// Example: Get a value by key
client.get('myKey', (err, reply) => {
  if (err) {
    console.error('Redis Get Error:', err)
  } else {
    console.log('Get result:', reply)
  }
}) */

// Close the Redis connection (when needed)
// client.quit();

module.exports = { client }
