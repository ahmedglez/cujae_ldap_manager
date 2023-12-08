const redisClient = require('../redis_client')

// Jest test suite
describe('Redis Database Tests', () => {
  beforeAll(async () => {
    // Create and connect to the Redis client
    await redisClient.client.connect()
  })

  afterAll(async () => {
    // Disconnect the Redis client and release resources
    redisClient.client.quit()
  })

  it('should connect to Redis', async () => {
    // Check if the Redis client is connected
    const isConnected = redisClient.client.isOpen
    expect(isConnected).toBeTruthy()
  })

  it('should set and get a value from Redis', async () => {
    // Set a key-value pair
    await redisClient.client.hSet('key', 'field', 'perro')

    // Get the value by key
    const value = await redisClient.client.hGetAll('key')

    expect(value).toEqual({
      field: 'perro',
    })
  })

  // Add more tests as needed
})
