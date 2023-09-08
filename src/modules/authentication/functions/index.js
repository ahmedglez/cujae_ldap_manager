const {
  addToBlackList,
  deleteRefreshToken,
  getRefreshToken,
  storeRefreshToken,
} = require('@src/services/auth.services')

const UserServices = require('@src/services/user.services')
const ProfileServices = require('@src/services/profile.services')

const {
  extractBaseFromDn,
  extractGroupsFromDn,
} = require('@src/helpers/dnHelper')

const { signToken } = require('@src/utils/authentication/tokens/token_sign')

const userService = UserServices()
const profileService = ProfileServices()

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

const refresh = async (req, res) => {
  const { username } = req.body

  const refreshToken = await getRefreshToken(username)

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token not found' })
  }

  const response = await userService.getByUsername(username)
  const user = response[0]

  if (!user) {
    return res.status(401).json({ message: 'User not found' })
  }

  const ldapDn = user.dn
  const groups = extractGroupsFromDn(ldapDn)
  const rootBaseDN = extractBaseFromDn(ldapDn)
  const localBaseDN = user.dn.replace(`uid=${user.uid},`, '')

  const last_time_logged = await profileService.getLastLoginByUsername(user.uid)
  const loginInfo = await profileService.updateLastTimeLogged(user.uid)

  const isAdmin = true

  const payload = {
    sub: user.uid,
    dn: user.dn,
    uid: user.uid,
    groups: groups,
    base: rootBaseDN,
    localBase: localBaseDN,
    firstname: user.givenName,
    lastname: user.sn,
    fullname: user.cn,
    email: user.mail,
    ci: user.CI,
    roles: isAdmin ? ['admin', 'user'] : ['user'],
    last_time_logged,
    loginInfo,
  }

  const newToken = signToken(payload, { expiresIn: '15 minutes' })
  const newRefreshToken = signToken(payload, { expiresIn: '1 day' })

  await deleteRefreshToken(username)
  setTimeout(async () => {
    storeRefreshToken(user.uid, newRefreshToken)
  }, 100)

  res.status(200).json({
    newToken,
    newRefreshToken,
  })
}

module.exports = { logout, refresh }
