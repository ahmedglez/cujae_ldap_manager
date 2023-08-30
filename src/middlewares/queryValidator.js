// queryValidator.js

const { user_types_query } = require('@src/constants/userTypes')

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const isValidUsername = (username) => {
  const usernameRegex = /^[a-z]+\.[a-z]+$/
  return usernameRegex.test(username)
}

const validateUserType = (userType) => {
  if (!!userType && !user_types_query.includes(userType)) {
    throw new Error(
      `Invalid userType, only "${user_types_query[0]}", "${user_types_query[1]}", and "${user_types_query[2]}" are allowed.`
    )
  }
}

const validateQuery = (query) => {
  validateUserType(query.userType)

  if (query.ci && !/^\d{8,10}$/.test(query.ci)) {
    throw new Error('Invalid ci parameter')
  }

  if (query.email && !isValidEmail(query.email)) {
    throw new Error('Invalid email parameter')
  }

  if (query.username && !isValidUsername(query.username)) {
    throw new Error('Invalid username parameter')
  }

  // Add more validations as needed

  return true
}

module.exports = validateQuery
