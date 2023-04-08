const jwt = require('jsonwebtoken')
const config = require('../../../config/config')
const secret = config.apiKey

const signToken = (payload, options) => {
  return jwt.sign(payload, secret, options)
}

module.exports = { signToken }
