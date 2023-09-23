const morgan = require('morgan')
const winston = require('winston')
const mongoose = require('mongoose') // Import mongoose
const { MongoDB } = require('winston-mongodb') // Import MongoDB transport
const config = require('@src/config/config')
const { decodeJWT } = require('@src/utils/authentication/tokens/jwtUtils')

const logger = require('@src/utils/logger')
const { validate } = require('@src/schemas/logs.schema')

morgan.token('user', (req) => {
  return req.user ? req.user.uid : 'anonymous'
})

const logFormat = (tokens, req, res) => {
  const status = tokens.status(req, res)
  const payload =
    req.headers.authorization !== undefined
      ? decodeJWT(req.headers.authorization.split(' ')[1])
      : undefined

  const log = {
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: parseInt(tokens.status(req, res)),
    content_length: tokens.res(req, res, 'content-length'),
    response_time: parseFloat(tokens['response-time'](req, res)),
    user:
      payload !== undefined
        ? payload.uid
        : req.body.username !== undefined
        ? req.body.username
        : 'anonymus',
    dn: payload !== undefined ? payload.dn : 'unknown',
    branch: payload !== undefined ? payload.localBase : 'unknown',
  }

  if (status < 400) {
    logger.info({ ...log })
  }
  if (status >= 400) {
    logger.error({
      ...log,
    })
  }
}

const addLoggerMiddleware = (app) => {
  mongoose.connect(config.mongodb.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

  const db = mongoose.connection

  db.on('error', (error) => {
    console.error('Error connecting to the database:', error.message)
  })

  winston.add(logger.transports[0])

  // Configure MongoDB transport for Winston
  logger.add(
    new MongoDB({
      db: config.mongodb.url, // Change this to your MongoDB URL
      level: 'info', // Adjust the level as needed
      useUnifiedTopology: true,
    })
  )

  app.use(morgan(logFormat))

  app.on('error', (err) => {
    if (
      err.name === 'ServerSelectionError' &&
      err.message === 'connection timed out'
    ) {
      console.error('Error connecting to the database:', err.message)
    }
  })
}

module.exports = addLoggerMiddleware
