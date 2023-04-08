const Joi = require('joi')

const responseSchema = Joi.object({
  success: Joi.boolean().required(),
  message: Joi.string().required(),
  data: Joi.any(),
})

const validate = (data, schema) => {
  const result = responseSchema.validate(data)
  if (result.error) {
    return {
      valid: false,
      errors: result.error.details.map((error) => error.message),
    }
  }
  return {
    valid: true,
  }
}

const validateResponse = (req, res, next) => {
  const result = res.locals.result
  const validationResult = validate(result, responseSchema)
  validationResult.valid ? next() : next(validationResult.errors)
}

module.exports = validateResponse
