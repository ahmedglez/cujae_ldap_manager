const jwt_decode = require('jwt-decode')

const decodeJWT = (jwt) => {
  const decodedToken = jwt_decode(jwt)
  return decodedToken
}

module.exports = {
  decodeJWT,
}
