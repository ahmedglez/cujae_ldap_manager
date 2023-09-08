const {
  addToBlackList,
  deleteRefreshToken,
} = require('@src/services/auth.services')

const clearSession = (req) => {
  return new Promise((resolve, reject) => {
    req.session.destroy((err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

const logout = (req, res) => {
  const accessToken = req.body.accessToken // You can adjust this based on how you send the token in the request
  clearSession(req)
  if (!accessToken) {
    return res.status(400).json({ message: 'Access token is required.' })
  }
  addToBlackList(req.user.uid, accessToken)
  return res.status(200).json({ message: 'User logged out successfully.' })
}

module.exports = { logout }
