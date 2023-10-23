// Endpoint to handle password reset
const express = require('express')
const router = express.Router()
const userService = require('@src/services/user.services')()
const {
  generateRecoveryCode,
  sendRecoveryPasswordEmailTo,
  checkRecoveryCode,
  sendSuccessPasswordEmailTo,
} = require('../services/restore-password.service')
const { validationResult, body } = require('express-validator')
const {
  passwordValidationMiddleware,
  hashPassword,
  verifyPassword,
} = require('../utils/passwordUtils')
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

/**
 * @openapi
 * /api/v1/forgot-password:
 *   post:
 *     tags: [Recovery Password]
 *     summary: Request a password reset.
 *     description: Request a password reset for a user.
 *     operationId: requestPasswordReset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emailOrUsername:
 *                 type: string
 *           required:
 *             - emailOrUsername
 *     responses:
 *       200:
 *         description: Password reset email sent successfully.
 *       400:
 *         description: Bad request. Invalid input data.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal Server Error.
 */

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

    if (user === undefined) {
      return res.status(404).json({ message: 'User not found.' })
    }

    const payload = {
      username: user.uid,
      name: user.name,
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

/**
 * @openapi
 * /api/v1/update-password:
 *   post:
 *     tags: [Update Password]
 *     summary: Update user password
 *     description: Update a user's password. The user must provide the old password, a new password, and confirm the new password.
 *     operationId: updateUserPassword
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 description: The user's old password.
 *               newPassword:
 *                 type: string
 *                 description: The new password.
 *               confirmPassword:
 *                 type: string
 *                 description: Confirmation of the new password.
 *           required:
 *             - oldPassword
 *             - newPassword
 *             - confirmPassword
 *     responses:
 *       200:
 *         description: Password updated successfully.
 *       400:
 *         description: Bad Request. The request is missing required fields or the passwords do not match.
 *       401:
 *         description: Unauthorized. The user is not authenticated.
 *       404:
 *         description: Not Found. User not found.
 *       500:
 *         description: Internal Server Error.
 */
router.post(
  '/reset-password',
  checkAuth,
  passwordValidationMiddleware,
  async (req, res) => {
    try {
      const { newPassword, confirmPassword, oldPassword } = req.body

      if (!newPassword || !confirmPassword) {
        throw boom.unauthorized(
          'New password and confirm password are required'
        )
      }

      if (newPassword !== confirmPassword) {
        throw boom.unauthorized('Passwords must be equal')
      }

      const payload = verifyToken(req.headers.authorization.split(' ')[1])

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

      const encriptedPassword = hashPassword(newPassword)
      const updatedUser = await userService.updateUser(
        payload.username,
        'userPassword',
        encriptedPassword
      )
      if (!!updatedUser) {
        await sendSuccessPasswordEmailTo(payload.name, payload.email)
        res.status(200).json({ success: true, message: 'updated user' })
      }
    } catch (error) {
      console.error('Error resetting password:', error)
      res.status(500).json({ message: 'Error updating password' })
    }
  }
)

module.exports = router
