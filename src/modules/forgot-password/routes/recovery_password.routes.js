// Endpoint to handle password reset
const express = require('express')
const router = express.Router()
const userService = require('@src/services/user.services')()
const {
  generateRecoveryCode,
  sendRecoveryPasswordEmailTo,
  checkRecoveryCode,
} = require('../services/restore-password.service')
const { validationResult, body } = require('express-validator')
const { passwordValidationMiddleware } = require('../utils/passwordUtils')
const { signToken } = require('@src/utils/authentication/tokens/token_sign')
const { verifyToken } = require('@src/utils/authentication/tokens/token_verify')
const { checkAuth, checkBlacklist } = require('@src/middlewares/auth.handler')
const boom = require('@hapi/boom')

// Validation rules for the email or username
const validateEmailOrUsername = [
  body('emailOrUsername')
    .notEmpty()
    .withMessage('Email or username is required')
    .trim()
    .escape(),
]

// Endpoint for initiating the password reset process
router.post('/forgot-password', validateEmailOrUsername, async (req, res) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { emailOrUsername } = req.body

  try {
    const user = emailOrUsername.includes('@')
      ? await userService.getByEmail(emailOrUsername)
      : await userService.getByUsername(emailOrUsername)

    if (user.uid === undefined) {
      return res.status(404).json({ message: 'User not found.' })
    }

    const payload = {
      username: user.uid,
      email: user.maildrop,
    }

    const token = signToken(payload, { expiresIn: '15 minutes' })

    const currentTime = new Date()
    const expiration = new Date(currentTime.getTime() + 15 * 60 * 1000) // 15 minutes in milliseconds

    const recoveryCode = await generateRecoveryCode(user, expiration)
    await sendRecoveryPasswordEmailTo(user, recoveryCode)

    res.json({
      message: 'Password reset email sent successfully.',
      token: token,
    })
  } catch (error) {
    console.error('Error in /forgot-password:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})
router.post(
  '/reset-password',
  checkAuth,
  passwordValidationMiddleware,
  async (req, res) => {
    try {
      const { recoveryCode, newPassword } = req.body
      const payload = verifyToken(req.headers.authorization.split(' ')[1])
      console.log('payload', payload)

      if (!payload) {
        const error = boom.unauthorized('Token is not valid')
        throw error
      }

      const checkedCode = await checkRecoveryCode(
        payload.username,
        recoveryCode
      )
      if (!checkedCode.isValid) {
        const error = boom.unauthorized(checkedCode.isValid.message)
        throw error
      }
    } catch (error) {
      console.error('Error resetting password:', error)
      res.status(400).json({ message: 'Invalid or expired recovery code.' })
    }
  }
)

module.exports = router
