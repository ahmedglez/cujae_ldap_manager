const jwt = require('jsonwebtoken')
const config = require('../../../config/config')
const secret = config.apiKey

const verifyToken = (token) => {
  return jwt.verify(token, secret)
}

module.exports = { verifyToken }
