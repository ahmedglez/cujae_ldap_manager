const passport = require('passport')
const { verifyToken } = require('../utils/authentication/tokens/token_verify')
const boom = require('@hapi/boom')

const checkAuth = (req, res, next) => {
  const auth = passport.authenticate('jwt', { session: false })
  auth(req, res, next)
}

module.exports = {
  checkAuth,
}
