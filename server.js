/* jshint node:true */
/* global require */
const CONFIG = require('./src/config/config.js')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const logger = require('./src/middlewares/logger.handler.js')
const express = require('express')
const morgan = require('morgan')
const addRoutes = require('./src/routes/routes.js')
const LdapAuth = require('./src/modules/authentication/LdapAuth.js')
const sessionMiddleWare = require('./src/middlewares/session.handler.js')
const User = require('./src/schemas/user.schema.js').User
//app initialization
const app = express()

// load app middlewares
// The order of the following middleware is very important!!
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json())
app.use(sessionMiddleWare)

morgan.token('user', (req) => {
  return req.user ? req.user.uid : 'anonymous'
})
app.use(
  morgan(function (tokens, req, res) {
    const log = {
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: tokens.status(req, res),
      content_length: tokens.res(req, res, 'content-length'),
      response_time: tokens['response-time'](req, res),
      user: (tokens.user = req.user.uid),
    }
    logger.info({ ...log })

    return [
      `method:${log.method}`,
      `url:${log.url}`,
      `status:${log.status}`,
      `content-lenght:${log.content_length}`,
      `response-time:${log.response_time}ms`,
      `user_uid:${log.user}`,
    ].join(' ')
  })
)

//LDAP initialization
const { usernameAttr, userOptions } = require('./src/constants/ldap_options.js')
LdapAuth.initialize(
  userOptions,
  app,
  (id) => User.findOne({ username: id }).exec(),
  async (user) => {
    console.log(`${user[usernameAttr]} has logged in`)
    let foundUser = await User.findOneAndUpdate(
      { username: user[usernameAttr] },
      user,
      {
        upsert: true,
        new: true,
      }
    ).exec()
    console.log(`${foundUser.username} is retrieved from database`)
    return foundUser
  }
)

//add routes to application
addRoutes(app)

// use the library express-passport-ldap-mongoose
// backward compatible mode
/*LdapAuth.init(CONFIG.ldap.dn, CONFIG.ldap.url, app, 
  (id) => User.findOne({ uid: id }).exec(), 
  (user) => User.findOneAndUpdate({ uid: user.uid }, user, { upsert: true, new: true }).exec()
)*/

// serve static pages
app.use(express.static('./src/public'))

// Start server
let port = CONFIG.server.port || 4000
console.log(`server listen on port ${port}`)
app.listen(port, CONFIG.server.host || '127.0.0.1')
