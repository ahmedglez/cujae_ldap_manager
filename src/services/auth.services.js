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
        throw new Error('Already logged out')
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
  try {
    await client.connect()
    if (client.isOpen) {
      const exists = await client.exists(token)
      disconnect()
      return exists === 0 ? false : true
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

isBlackListed(
  'yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhaG1lZGl2YW4uZ29uemFsZXoiLCJkbiI6InVpZD1haG1lZGl2YW4uZ29uemFsZXosb3U9dXN1YXJpb3Msb3U9aW5mb3JtYXRpY2EsZGM9Y3VqYWUsZGM9ZWR1LGRjPWN1IiwidWlkIjoiYWhtZWRpdmFuLmdvbnphbGV6IiwiZ3JvdXBzIjpbInVzdWFyaW9zIiwiaW5mb3JtYXRpY2EiXSwiYmFzZSI6ImRjPWN1amFlLGRjPWVkdSxkYz1jdSIsImxvY2FsQmFzZSI6Im91PXVzdWFyaW9zLG91PWluZm9ybWF0aWNhLGRjPWN1amFlLGRjPWVkdSxkYz1jdSIsImZpcnN0bmFtZSI6ImFobWVkaXZhbi5nb256YWxleiIsImxhc3RuYW1lIjoiR29uesOhbGV6IEJldGFuY291cnQiLCJmdWxsbmFtZSI6IkFobWVkIEl2w6FuIiwiZW1haWwiOiJhaG1lZGl2YW4uZ29uemFsZXpAY3VqYWUuZWR1LmN1IiwiY2kiOiIwMDA5MjA2ODQyNiIsInJvbGVzIjpbImFkbWluIiwidXNlciJdLCJsYXN0X3RpbWVfbG9nZ2VkIjoiMjAyMy0wOS0wNlQxOTozMToyNS43ODNaIiwibG9naW5JbmZvIjoiOS82LzIwMjMsIDEwOjU0OjM3IFBNIiwiaWF0IjoxNjk0MDU1Mjc4LCJleHAiOjE2OTQwNTc5Nzh9.0WKdygQ10i7I9Tu4yIPhmJZeyJ7RoJ0IYybe2Wlh0SM'
)

module.exports = {
  addToBlackList,
  isBlackListed,
}
