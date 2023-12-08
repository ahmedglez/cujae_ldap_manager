const express = require('express')
const router = express.Router()
const userService = require('@src/services/user.services')()
const {
  sendSuccessPasswordEmailTo,
} = require('../services/restore-password.service')
const { validationResult, body } = require('express-validator')
const {
  passwordValidationMiddleware,
  hashPassword,
  verifyPassword,
} = require('../utils/passwordUtils')
const { verifyToken } = require('@src/utils/authentication/tokens/token_verify')
const { checkAuth, checkBlacklist } = require('@src/middlewares/auth.handler')
const boom = require('@hapi/boom')

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
  '/update-password',
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
      if (!oldPassword) {
        throw boom.unauthorized('Password is required')
      }

      if (newPassword !== confirmPassword) {
        throw boom.unauthorized('Passwords must be equal')
      }

      const token = req.headers.authorization.split(' ')[1]
      const payload = verifyToken(token)

      if (!payload) {
        throw boom.unauthorized('Token is not valid')
      }

      const user = await userService.getByUsername(payload.uid)

      if (!user) {
        throw boom.unauthorized('User not found')
      }

      if (!verifyPassword(oldPassword, user.userPassword)) {
        throw boom.unauthorized('Invalid password')
      }

      const encryptedPassword = hashPassword(newPassword)
      const updatedUser = await userService.updateUser(
        payload.uid,
        'userPassword',
        encryptedPassword
      )

      if (!!updatedUser) {
        await sendSuccessPasswordEmailTo(user.name, user.maildrop)
        res.status(200).json({ success: true, message: 'Updated user' })
      }
    } catch (error) {
      console.error('Error updating password:', error)
      res.status(500).json({ message: 'Error updating password' })
    }
  }
)

module.exports = router
