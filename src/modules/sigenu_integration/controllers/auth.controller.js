const profileService = require('@src/services/profile.services')()
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
        await profileService.getLastLoginByUsername(user.uid)
        await profileService.updateLastTimeLogged(user.uid)

        const parsedPayload = parseLoginPayload(user)
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
