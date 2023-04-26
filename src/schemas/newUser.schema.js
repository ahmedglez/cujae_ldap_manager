const joi = require('joi')

const newUserSchema = joi.object({
  uid: joi.string(),
  cn: joi.string(),
  sn: joi.string(),
  email: joi.string(),
  ci: joi.string(),
  studentClassGroup: joi.string(),
  displayName: joi.string(),
  password: joi.string(),
  confirmPassword: joi.string(),
})

module.exports = newUserSchema
