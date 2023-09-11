// Endpoint to handle password reset
const express = require('express')
const router = express.Router()
const userService = require('@src/services/user.services')()
const {
  generateRecoveryCode,
  sendRecoveryPasswordEmailTo,
} = require('../services/restore-password.service')
const { validationResult } = require('express-validator')
const { body } = require('express-validator')

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

    await generateRecoveryCode(user, new Date(900000)) //15 min
    await sendRecoveryPasswordEmailTo(user)

    res.json({ message: 'Password reset email sent successfully.' })
  } catch (error) {
    console.error('Error in /forgot-password:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})
router.post('/reset-password', (req, res) => {
  // Retrieve the reset token and new password from the request body
  const { token, newPassword } = req.body

  try {
    // Verify the reset token
    const decodedToken = jwt.verify(token, secretKey)

    // Check if the token is still valid
    redisClient.get(token, (error, storedEmailOrUsername) => {
      if (error) {
        throw new Error('Error retrieving token from Redis.')
      }

      if (storedEmailOrUsername === decodedToken.emailOrUsername) {
        // Token is valid, update the user's password in your database
        // Replace this with your password update logic
        // For example, you might hash the new password and update it in the database
        // const hashedPassword = hashPassword(newPassword);
        // updateUserPassword(decodedToken.emailOrUsername, hashedPassword);

        // Respond with a success message
        res.json({ message: 'Password reset successful.' })

        // Delete the token from Redis (optional)
        redisClient.del(token)
      } else {
        // Token does not match the stored value
        throw new Error('Invalid or expired token.')
      }
    })
  } catch (error) {
    // Handle token verification errors
    console.error('Error resetting password:', error)
    res.status(400).json({ message: 'Invalid or expired token.' })
  }
})

module.exports = router
