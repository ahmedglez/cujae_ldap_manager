const passwordSchema = require('../schemas/passwordValidation.schema')

const passwordValidationMiddleware = (req, res, next) => {
  // Retrieve the new password from the request body
  const newPassword = req.body.newPassword

  // Validate the new password against the schema
  const isPasswordValid = passwordSchema.validate(newPassword)

  if (!isPasswordValid) {
    // Password doesn't meet the requirements
    const validationErrors = passwordSchema.validate(newPassword, {
      list: true,
    })

    // Construct an error message based on the validation specifics
    const errorMessages = []

    if (validationErrors.includes('min')) {
      errorMessages.push('Password must be at least 8 characters long.')
    }

    if (validationErrors.includes('max')) {
      errorMessages.push('Password cannot exceed 100 characters.')
    }

    if (validationErrors.includes('uppercase')) {
      errorMessages.push('Password must contain at least one uppercase letter.')
    }

    if (validationErrors.includes('lowercase')) {
      errorMessages.push('Password must contain at least one lowercase letter.')
    }

    if (validationErrors.includes('digits')) {
      errorMessages.push('Password must contain at least 2 digits.')
    }

    if (validationErrors.includes('symbols')) {
      errorMessages.push('Password must contain at least 1 special symbol.')
    }

    if (validationErrors.includes('spaces')) {
      errorMessages.push('Password should not contain spaces.')
    }

    if (validationErrors.includes('oneOf')) {
      errorMessages.push('Password cannot be one of the common weak passwords.')
    }

    // Respond with error messages and suggestions
    return res.status(400).json({
      message: 'Invalid password format.',
      errors: errorMessages,
      suggestion: 'Suggested password format: Sample@Pass123', // Customize as needed
    })
  }

  // Password is valid; proceed to the next middleware or route handler
  next()
}

module.exports = { passwordValidationMiddleware }
