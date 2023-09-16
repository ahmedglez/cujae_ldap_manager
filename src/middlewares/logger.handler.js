const winston = require('winston')
const { MongoDB } = require('winston-mongodb')
const config = require('../config/config')
const morgan = require('morgan')
const mongoose = require('mongoose') // Import Mongoose

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp()),
  transports: [
    new MongoDB({
      db: config.mongodb.url,
      options: { useUnifiedTopology: true },
      collection: 'logs',
      level: 'info',
      capped: true,
      cappedSize: 1000000,
      cappedMax: 1000,
      metaKey: 'meta',
    }),
  ],
})

morgan.token('user', (req) => {
  return req.user ? req.user.uid : 'anonymous'
})

const logFormat = (tokens, req, res) => {
  const log = {
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: tokens.status(req, res),
    content_length: tokens.res(req, res, 'content-length'),
    response_time: tokens['response-time'](req, res),
    user: req.user === undefined ? 'anonymous' : req?.user?.uid,
  }

  logger.info({ ...log })

  return [
    `method:${log.method}`,
    `url:${log.url}`,
    `status:${log.status}`,
    `content-length:${log.content_length}`,
    `response-time:${log.response_time}ms`,
    `user_uid:${log.user}`,
  ].join(' ')
}

const addLoggerMiddleware = (app) => {
  try {
    // Attempt to establish the database connection and configure logger
    mongoose.connect(config.mongodb.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    const db = mongoose.connection

    db.on('error', (error) => {
      console.error('Error connecting to the database:', error.message)
    })

    db.once('open', () => {
      console.log('Connected to MongoDB (ldapDB)')
      winston.add(logger.transports[0])

      // Register the morgan middleware
      app.use(morgan(logFormat))
    })

    // Add error connection handler
    app.on('error', (err) => {
      if (
        err.name === 'ServerSelectionError' &&
        err.message === 'connection timed out'
      ) {
        console.error('Error connecting to the database:', err.message)
      }
    })
  } catch (error) {
    console.error('Error connecting to the database:', error.message)
  }
}

module.exports = addLoggerMiddleware
