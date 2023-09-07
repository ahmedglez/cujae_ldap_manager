const passport = require('passport')
const { verifyToken } = require('../utils/authentication/tokens/token_verify')
const boom = require('@hapi/boom')
const { responseError } = require('../schemas/response.schema')
const { isBlackListed } = require('@src/services/auth.services')

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

// Middleware to check if a JWT token is blacklisted
const checkBlacklist = async (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1] // Assuming the token is in the Authorization header

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const isBlacklisted = await isBlackListed(token)
    console.log('isBlacklisted', isBlacklisted)

    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        error: 'Token is expired',
        message: 'Try to Log In again',
      })
    }

    // Token is not blacklisted, continue with the request
    next()
  } catch (error) {
    console.error('Error checking token blacklist:', error)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

module.exports = {
  checkAuth,
  checkRoles,
  checkBlacklist,
}
