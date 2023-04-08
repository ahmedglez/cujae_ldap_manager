const session = require('express-session')
const MongoStore = require('connect-mongo')
const CONFIG = require('../config/config')
const mongoose = require('mongoose')


//MONGODB configuration
mongoose.Promise = Promise
const mongoClientPromise = mongoose
  .connect(CONFIG.mongodb.url, {
    user: CONFIG.mongodb.user,
    pass: CONFIG.mongodb.pass,
    authSource: 'admin',
  })
  .then((m) => m.connection.getClient())

const sessionMiddleWare = session({
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

module.exports = sessionMiddleWare
