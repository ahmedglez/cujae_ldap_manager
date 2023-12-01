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
  addUserRegistry,
} = require('@src/modules/authentication/services/auth.services')

const {
  parseLoginPayload,
} = require('@src/modules/sigenu_integration/helpers/sigenu.helper')

const login_sigenu = async function (req, res, next) {
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

        const parsedPayload = parseLoginPayload(user)

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
            res.status(200).json({
              ...parsedPayload,
            })
          }
        })
      }
    }
  )(req, res, next)
}

module.exports = { login_sigenu }
