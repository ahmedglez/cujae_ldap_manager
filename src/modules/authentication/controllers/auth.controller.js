const { isSuperAdmin, isAdmin } = require('@src/services/auth.services')
const profileService = require('@src/services/profile.services')()

/* helpers */
const {
  extractBaseFromDn,
  extractGroupsFromDn,
} = require('@src/helpers/dnHelper')

const { signToken } = require('@src/utils/authentication/tokens/token_sign')
const { responseSuccess } = require('@src/schemas/response.schema')
const passport = require('passport')

const {
  addToBlackList,
  deleteRefreshToken,
  getRefreshToken,
  storeRefreshToken,
} = require('@src/services/auth.services')

const {
  addUserRegistry,
} = require('@src/modules/authentication/services/auth.services')

const login = async function (req, res, next) {
  passport.authenticate(
    'ldap',
    {
      successRedirect: '/dashboard',
      failureRedirect: '/login',
      failureFlash: true,
    },
    async (err, user) => {
      if (err) {
        res.status(401).json({ success: false, message: err.message })
        return
      }
      if (!user) {
        res
          .status(401)
          .json({ success: false, message: 'Usuario no encontrado' })
      } else {
        // Agrega un nuevo registro al usuario
        await addUserRegistry(user)

        const last_time_logged = await profileService.getLastLoginByUsername(
          user.uid
        )
        const loginInfo = await profileService.updateLastTimeLogged(user.uid)
        // Example usage
        const ldapDn = user.dn
        const groups = extractGroupsFromDn(ldapDn)
        const rootBaseDN = extractBaseFromDn(ldapDn)
        const localBaseDN = user.dn.replace(`uid=${user.uid},`, '')

        let roles = ['user']
        const isSpAdmin = await isSuperAdmin(user.uid)
        if (isSpAdmin) {
          roles = [...roles, 'admin', 'superadmin']
        } else {
          const isAdm = await isAdmin(user.uid, localBaseDN)
          isAdm ? (roles = [...roles, 'admin']) : [...roles]
        }

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
          roles: roles,
          last_time_logged,
          loginInfo,
        }

        const userObj = { ...user }
        const token = signToken(payload, { expiresIn: '15 minutes' })
        const refreshToken = signToken(payload, { expiresIn: '1 hour' })

        /*  await storeRefreshToken(user.uid, refreshToken) */

        req.login(user, (loginErr) => {
          if (loginErr) {
            return next(loginErr)
          }
          if (!!user) {
            const data = {
              token: token,
              refreshToken: refreshToken,
              user: userObj,
            }
            return responseSuccess(res, 'authentication succeeded', data)
          }
        })
      }
    }
  )(req, res, next)
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

  const refreshToken = await getRefreshToken(username, (err) => {
    if (err) {
      console.error('Error getting refresh token:', err)
    }
  })

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

module.exports = { login, logout, refresh, clearSession }
