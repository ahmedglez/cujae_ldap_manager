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

const logout = async function (req, res, next) {
  try {
    const token = req.headers.authorization.split(' ')[1]
    const isLogout = await addToBlackList(token)
    await clearSession(req)
    await deleteRefreshToken(req.user.uid)
    if (isLogout) {
      res.status(200).json({
        success: true,
        message: 'user logged out correctly',
      })
    } else {
      res.status(500).json({
        success: false,
        error: 'Invalid token',
      })
    }
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token' })
  }
}

module.exports = { logout }
