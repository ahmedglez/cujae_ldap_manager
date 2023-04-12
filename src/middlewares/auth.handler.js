const passport = require('passport')
const { verifyToken } = require('../utils/authentication/tokens/token_verify')
const boom = require('@hapi/boom')
const { responseError } = require('../schemas/response.schema')

const checkAuth = (req, res, next) => {
  const auth = passport.authenticate('jwt', { session: false })
  auth(req, res, next)
}

const checkRoles = (...roles) => {
  return (req, res, next) => {
    const payload = verifyToken(req.headers.authorization.split(' ')[1])
    if (!payload) {
      const error = boom.unauthorized('Token is not valid')
      next(error)
    }
    const { roles: userRoles } = payload
    const hasRole = roles.some((role) => userRoles.includes(role))
    if (hasRole) {
      next()
    } else {
      responseError(
        res,
        `You don't have permission to access`,
        boom.unauthorized(
          'Invalid token, you are not authorized to perform this action'
        )
      )
    }
  }
}

module.exports = {
  checkAuth,
  checkRoles,
}
