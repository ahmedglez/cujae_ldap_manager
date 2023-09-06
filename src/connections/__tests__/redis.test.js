const { Client } = require('redis-om')

const url = process.env.REDIS_URL

// Jest test suite
describe('Redis Database Tests', () => {
  it('should connect to Redis', async () => {
    // Create a Redis client and specify the host and port
    const client = new Client()

    // Define the Redis connection URL (e.g., 'redis://localhost:6379')
    const redisUrl = url || 'redis://localhost:6379'

    console.log('Connecting to Redis using URL:', redisUrl)

    // Attempt to connect to Redis using the specified URL
    await client.open(redisUrl)

    // Check if the client is open (connected)
    const isOpen = client.isOpen()
    console.log('Redis client is open:', isOpen)

    // Close the Redis client to release resources
    await client.close()

    // Wait for the connection to be established
    expect(isOpen).toBeTruthy()
  })
})
