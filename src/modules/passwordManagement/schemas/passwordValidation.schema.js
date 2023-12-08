const passwordValidator = require('password-validator')

const passwordSchema = new passwordValidator()

passwordSchema
  .is()
  .min(8)
  .is()
  .max(100) // You can adjust the maximum length as needed
  .has()
  .uppercase() // Must have uppercase letters
  .has()
  .lowercase() // Must have lowercase letters
  .has()
  .digits(2) // Must have at least 2 digits
  .has()
  .symbols(1) // Must have at least 1 special symbol
  .has()
  .not()
  .spaces() // Should not have spaces
  .is()
  .not()
  .oneOf(['Passw0rd', 'Password123', '123', 'admin', 'admin1234', '1234']) // Blacklist these values
  .is()
  .not()
  .oneOf(['AnotherWeakPassword', '12345678', 'qwerty']) // Add more weak passwords here

module.exports = passwordSchema
