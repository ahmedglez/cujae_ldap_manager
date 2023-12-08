/**
 * Passport LDAP authentication module
 */

const passport = require('passport')
const CustomStrategy = require('passport-custom').Strategy
const JwtStrategy = require('@src/utils/authentication/strategies/jwtStrategy')
const { authenticate } = require('ldap-authentication')
const userService = require('@src/services/user.services')()
const User = require('@src/schemas/user.schema').User
const config = require('@src/config/config')
const {
  login_sigenu,
} = require('@src/modules/sigenu_integration/controllers/auth.controller')
const { version } = config.api

const {
  login,
  logout,
  refresh,
} = require('@src/modules/authentication/controllers/auth.controller.js')

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
 * @param {string} [sigenuLoginUrl]
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
  _loginUrl = loginUrl || `/api/${version}/login`
  _logoutUrl = logoutUrl || `/api/${version}/logout`
  _sigenuLoginUrl = `/api/${version}/sigenu/login`
  _refreshUrl = '/api/${version}/refresh'
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

        const localSession = { user: username }

        /* if (localSession.user === req.session?.passport?.user)
          throw new Error('log out before logging back in') */

        const response = await userService.getByUsername(username)

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

        console.log('options', options)
        // ldap authenticate the user
        const user = await authenticate(options)
        console.log('user authenticated', user)
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

  /**
   * @openapi
   * /api/v1/login:
   *   post:
   *     tags: [Authentication]
   *     summary: User login.
   *     description: Authenticate a user using LDAP credentials.
   *     operationId: loginUser
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               username:
   *                 type: string
   *               password:
   *                 type: string
   *           required:
   *             - username
   *             - password
   *     responses:
   *       200:
   *         description: User authenticated successfully.
   *       401:
   *         description: Authentication failed. Invalid credentials or user not found.
   *       500:
   *         description: An error occurred during authentication.
   */

  router.post(_loginUrl, login)

  /**
   * @openapi
   * /api/v1/sigenu/login:
   *   post:
   *     tags: [Authentication, SIGENU]
   *     summary: User login.
   *     description: Authenticate a user using LDAP credentials.
   *     operationId: loginUser
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               username:
   *                 type: string
   *               password:
   *                 type: string
   *           required:
   *             - username
   *             - password
   *     responses:
   *       200:
   *         description: User authenticated successfully.
   *       401:
   *         description: Authentication failed. Invalid credentials or user not found.
   *       500:
   *         description: An error occurred during authentication.
   */
  router.post(_sigenuLoginUrl, login_sigenu)

  /**
   * @openapi
   * /api/v1/logout:
   *   post:
   *     tags: [Authentication]
   *     summary: User logout.
   *     description: Log out a user and invalidate their access token.
   *     operationId: logoutUser
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               accessToken:
   *                 type: string
   *           required:
   *             - accessToken
   *     responses:
   *       200:
   *         description: User logged out successfully.
   *       400:
   *         description: Bad request. Access token is required.
   */

  router.post(_logoutUrl, logout)

  /**
   * @openapi
   * /api/v1/refresh:
   *   post:
   *     tags: [Authentication]
   *     summary: Refresh access token.
   *     description: Refresh the user's access token using a refresh token.
   *     operationId: refreshAccessToken
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               username:
   *                 type: string
   *           required:
   *             - username
   *     responses:
   *       200:
   *         description: Access token successfully refreshed.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 newToken:
   *                   type: string
   *                   description: The new access token.
   *                 newRefreshToken:
   *                   type: string
   *                   description: The new refresh token.
   *       401:
   *         description: User not found or refresh token not found.
   */

  router.post(_refreshUrl, refresh)
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

module.exports.init = init
module.exports.initialize = initialize
