/**
 * Passport LDAP authentication module
 */

const passport = require('passport')
const CustomStrategy = require('passport-custom').Strategy
const JwtStrategy = require('../../utils/authentication/strategies/jwtStrategy')
const { authenticate } = require('ldap-authentication')
const UserServices = require('../../services/user.services')
const User = require('../../schemas/user.schema').User
const ProfileServices = require('../../services/profile.services')
const { checkAuth, checkRoles } = require('@src/middlewares/auth.handler')
const { logout } = require('./functions/index.js')

/* helpers */
const {
  extractBaseFromDn,
  extractGroupsFromDn,
} = require('../../helpers/dnHelper')

const { signToken } = require('../../utils/authentication/tokens/token_sign')
const { responseSuccess } = require('../../schemas/response.schema')

const userService = UserServices()
const profileService = ProfileServices()

var _backwardCompatible = false
var _dn
var _findFunc
var _insertFunc
var _loginUrl
var _logoutUrl
var _usernameAttributeName

/**
 * @deprecated since version 3.0.0. Use initialize() instead
 *
 * Set up ldap server information, callbacks, and express route.
 *
 * @param {object|string} opt - if is an object, the options object to pass to ldapauth. if is a string, is ldap search base (backward compatible)
 *                              in opt object, literal `{{username}}` will be replaced with value in req.body.username
 * @param {string} ldapurl - ldap server url (if url is defined in opt, this will be ignored)
 * @param {object} router - express router
 * @param {function} findFunc - function(id) to find the user in local db by id
 * @param {function} insertFunc - function(user) to upsert user into local db
 * @param {string} [loginUrl] - path to login page. Default: /login
 * @param {string} [logoutUrl] - path to logout page. Default: /logout
 */

var init = function (
  opt,
  ldapurl,
  router,
  findFunc,
  insertFunc,
  loginUrl,
  logoutUrl
) {
  if (typeof opt === 'string') {
    // backward compatible mode
    console.log(
      'express-passport-ldap-mongoose: DeprecationWarning: calling init with DN string as first argument will be removed in a future version. Use an option object instead'
    )
    _dn = opt
    _backwardCompatible = true
  }
  _findFunc = findFunc
  _insertFunc = insertFunc
  _loginUrl = loginUrl || '/login'
  _logoutUrl = logoutUrl || '/logout'
  _usernameAttributeName = ''

  passport.use(
    'ldap',
    new CustomStrategy(async (req, done) => {
      try {
        if (!req.body.username || !req.body.password) {
          throw new Error('username and password must be both provided')
        }
        const username = req.body.username
        const password = req.body.password

        if (req.session.passport !== undefined)
          throw new Error('log out before logging back in')

        const res = await userService.getByUsername(username)
        const response = res[0]

        // if user doesn't exists
        if (response === undefined) {
          throw new Error('username or password incorrect')
        }
        let options = {}
        if (_backwardCompatible) {
          _usernameAttributeName = 'uid'
          options = {
            ldapOpts: {
              url: ldapurl,
            },
            userDn: `uid=${username},${_dn}`,
            userPassword: password,
            userSearchBase: _dn,
            usernameAttribute: 'uid',
            username: username,
          }
        } else {
          _usernameAttributeName = opt.usernameAttribute
          options = {
            ldapOpts: opt.ldapOpts,
            userPassword: password,
            userSearchBase: opt.userSearchBase,
            usernameAttribute: _usernameAttributeName,
            username: username,
            starttls: opt.starttls,
          }
          if (opt.userDn) {
            options.userDn = opt.userDn
              .replace('{{username}}', username)
              .replace(
                '{{branch}}',
                response.objectName.split(',')[2].replace('ou=', '')
              )
          }
          if (opt.adminDn) {
            options.adminDn = opt.adminDn
          }
          if (opt.adminPassword) {
            options.adminPassword = opt.adminPassword
          }
        }
        // ldap authenticate the user
        const user = await authenticate(options)
        // success
        done(null, user)
      } catch (error) {
        // authentication failure
        done(error, null)
      }
    })
  )

  passport.use(JwtStrategy)

  passport.serializeUser((user, done) => {
    if (user[_usernameAttributeName]) {
      done(null, user[_usernameAttributeName])
    } else {
      done(
        'User from ldap server does not have field ' + _usernameAttributeName
      )
    }
  })

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findOne({
        username: id,
      })
      if (!user) {
        // User does not exist
        return done(null, user)
      }
      return done(null, user)
    } catch (error) {
      return done(error)
    }
  })

  router.use(passport.initialize())
  router.use(passport.session())
  // login
  router.post(_loginUrl, login)
  router.post(_logoutUrl, checkAuth, logout)
}

/**
 * Set up ldap server information, callbacks, and express route.
 *
 * @param {object} opt - The options object to pass to ldapauth.
 * @param {object} router - express router
 * @param {function} findFunc - function(id) to find the user in local db by id
 * @param {function} insertFunc - function(user) to upsert user into local db
 * @param {string} [loginUrl] - path to login page. Default: /login
 * @param {string} [logoutUrl] - path to logout page. Default: /logout
 */
const initialize = function (
  opt,
  router,
  findFunc,
  insertFunc,
  loginUrl,
  logoutUrl
) {
  return init(opt, '', router, findFunc, insertFunc, loginUrl, logoutUrl)
}

/**
 * Customized login authentication handler to send {success: true}
 * on successful authenticate, or {success: false} on failed authenticate
 */
const login = function (req, res, next) {
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
          .json({ success: false, message: 'User cannot be found' })
      } else {
        const isAdmin = user.right === 'Todos'
        const last_time_logged = await profileService.getLastLoginByUsername(
          user.uid
        )
        const loginInfo = await profileService.updateLastTimeLogged(user.uid)
        // Example usage
        const ldapDn = user.dn
        const groups = extractGroupsFromDn(ldapDn)
        const rootBaseDN = extractBaseFromDn(ldapDn)
        const localBaseDN = user.dn.replace(`uid=${user.uid},`, '')

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

        const userObj = { ...user }
        const token = signToken(payload, { expiresIn: '15 minutes' })
        const refreshToken = signToken(payload, { expiresIn: '1 day' })

        req.login(user, (loginErr) => {
          if (loginErr) {
            return next(loginErr)
          }
          _insertFunc(user).then((user) => {
            const data = {
              token: token,
              refreshToken: refreshToken,
              user: userObj,
            }
            return responseSuccess(res, 'authentication succeeded', data)
          })
        })
      }
    }
  )(req, res, next)
}

module.exports.init = init
module.exports.initialize = initialize
