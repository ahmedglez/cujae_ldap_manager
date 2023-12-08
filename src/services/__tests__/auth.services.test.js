const redisClient = require('../../connections/redis_client')

describe('addToBlackList Service', () => {
  beforeAll(async () => {
    // Create and connect to the Redis client
    await redisClient.client.connect()
  })

  it('should connect to Redis', async () => {
    // Check if the Redis client is connected
    const isConnected = redisClient.client.isOpen
    expect(isConnected).toBeTruthy()
  })

  afterAll(async () => {
    // Disconnect the Redis client and release resources
    redisClient.client.quit()
  })

  it('should add a token to the blacklist when connected', async () => {
    const token = 'your_jwt_token_here'
    const expirationInSeconds = 3600 // 1 hour
    const defaultValue = '1'

    redisClient.client.hSet(token, expirationInSeconds, defaultValue)

    const value = await redisClient.client.hGetAll(token)

    console.log(value)

    expect(value).toEqual({
      3600: defaultValue,
    })
  })
})
