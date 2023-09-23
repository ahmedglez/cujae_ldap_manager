const axios = require('axios')
const axiosMockAdapter = require('axios-mock-adapter')
const WebSocket = require('ws')

// Import your REST API server module here.
// Import your WebSocket server module here.

describe('Integration Test', () => {
  let axiosMock
  let ws
  let wsMessages

  beforeAll(() => {
    // Start your REST API server (if it's not already running)
    // Start your WebSocket server (if it's not already running)

    // Create a WebSocket connection
    ws = new WebSocket('ws://localhost:8080')
    wsMessages = []

    // Handle messages from the WebSocket server
    ws.on('message', (message) => {
      wsMessages.push(message)
    })

    // Create an instance of the axios mock adapter
    axiosMock = new axiosMockAdapter(axios)

    // Mock the HTTP request to your REST API
    axiosMock
      .onGet('http://localhost:3000/logs')
      .reply(200, { data: 'Mocked data from REST API' })
  })

  afterAll(() => {
    // Close the WebSocket connection and perform any necessary cleanup
    ws.close()
    axiosMock.restore()
  })

  it('should perform HTTP and WebSocket communication', async () => {
    // Make an HTTP request to your REST API
    const response = await axios.get('http://localhost:3000/logs')

    expect(response.status).toBe(200)
    expect(response.data).toEqual({ data: 'Mocked data from REST API' })

    // Send a message to the WebSocket server
    ws.send('Hello, WebSocket server!')

    // Wait for a moment to allow the WebSocket server to process the message
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Assertions for WebSocket messages
    expect(wsMessages).toContain('Hello, WebSocket server!')
  })
})
