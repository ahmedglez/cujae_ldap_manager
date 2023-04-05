/* jshint node:true */
/* global require */
const CONFIG = require('./src/config/config.js')
const mongoose = require('mongoose')
const logger = require('morgan')
const bodyParser = require('body-parser')
const express = require('express')
const addRoutes = require('./src/routes/routes.js')
const LdapAuth = require('./src/modules/authentication/LdapAuth.js')

//MONGODB configuration
mongoose.Promise = Promise
const mongoClientPromise = mongoose
  .connect(CONFIG.mongodb.url, {
    user: CONFIG.mongodb.user,
    pass: CONFIG.mongodb.pass,
    authSource: 'admin',
  })
  .then((m) => m.connection.getClient())
const session = require('express-session')
const MongoStore = require('connect-mongo')
const User = require('./src/models/model.js').User
var sessionMiddleWare = session({
  secret: CONFIG.sessionSecret,
  store: MongoStore.create({
    clientPromise: mongoClientPromise,
  }),
  resave: true,
  saveUninitialized: true,
  unset: 'destroy',
  cookie: {
    httpOnly: false,
    maxAge: 1000 * 3600 * 24,
    secure: false, // this need to be false if https is not used. Otherwise, cookie will not be sent.
  },
})

//app initialization
const app = express()

//add routes to application
addRoutes(app)

// The order of the following middleware is very important!!
app.use(express.json())
app.use(sessionMiddleWare)
// use the library express-passport-ldap-mongoose
// backward compatible mode
/*LdapAuth.init(CONFIG.ldap.dn, CONFIG.ldap.url, app, 
  (id) => User.findOne({ uid: id }).exec(), 
  (user) => User.findOneAndUpdate({ uid: user.uid }, user, { upsert: true, new: true }).exec()
)*/

// load app middlewares
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json())

// new mode, simple user
let usernameAttr = 'uid'
let searchBase = CONFIG.ldap.dn
let admOptions = {
  ldapOpts: {
    url: CONFIG.ldap.url,
    //tlsOptions: { rejectUnauthorized: false }
  },
  adminDn: `cn=read-only-admin,dc=example,dc=com`,
  adminPassword: 'password',
  userSearchBase: searchBase,
  usernameAttribute: usernameAttr,
  //starttls: true
}
let userOptions = {
  ldapOpts: {
    url: CONFIG.ldap.url,
    //tlsOptions: { rejectUnauthorized: false }
  },
  userDn: `uid={{username}},ou=usuarios,ou={{branch}},dc=cujae,dc=edu,dc=cu`,
  userSearchBase: searchBase,
  usernameAttribute: usernameAttr,
  //starttls: true
}

//LDAP initialization
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

// serve static pages
app.use(express.static('./src/public'))

// Start server
let port = CONFIG.server.port || 4000
console.log(`server listen on port ${port}`)
app.listen(port, CONFIG.server.host || '127.0.0.1')
