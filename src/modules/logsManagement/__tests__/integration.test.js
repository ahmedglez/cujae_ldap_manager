const request = require('supertest')
const apiUrl = 'http://127.0.0.1:4000/api/v1'
const config = require('@src/config/config')

const username = config.tests.username
const password = config.tests.password

const randomNumber = Math.floor(Math.random() * 100000000)
  .toString()
  .padStart(8, '0')
const TEST_URL_ID = `/${randomNumber}`

describe('API Tests', () => {
  it('should handle authentication with incorrect credentials', async () => {
    const response = await request(apiUrl).post('/login').send({
      username: 'incorrectUsername',
      password: 'incorrectPassword',
    })

    expect(response.statusCode).toBe(401)
  })

  it('should get logs with a valid JWT token', async () => {
    const response = await request(apiUrl).post('/login').send({
      username: username,
      password: password,
    })

    expect(response.statusCode).toBe(200)
    
    const authToken = response.body.data.token

    const testRequest = await request(apiUrl)
      .get(TEST_URL_ID)
      .set('Authorization', `Bearer ${authToken}`)

    const responselogs = await request(apiUrl)
      .get(
        `/logs?method=GET&user=${username}&url=/api/v1${TEST_URL_ID}&timeframe=today`
      )
      .set('Authorization', `Bearer ${authToken}`)

    expect(responselogs.statusCode).toBe(200)
    expect(responselogs._body.logs.length).toBeGreaterThan(0)
   
  })
})
