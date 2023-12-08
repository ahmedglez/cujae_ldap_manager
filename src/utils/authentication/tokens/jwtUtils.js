const jwt_decode = require('jwt-decode')

const decodeJWT = (jwt) => {
  const decodedToken = jwt_decode(jwt)
  return decodedToken
}

const getAuthTokenType = (authorizationHeader) => {
  if (!authorizationHeader) {
    return undefined
  }

  const [authType, token] = authorizationHeader.split(' ')

  if (authType.toLowerCase() === 'bearer') {
    return { type: 'Bearer', token }
  } else if (authType.toLowerCase() === 'basic') {
    return { type: 'Basic', token }
  }

  return undefined
}

module.exports = {
  decodeJWT,
  getAuthTokenType
}
