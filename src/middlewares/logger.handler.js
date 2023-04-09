const winston = require('winston')
const { MongoDB } = require('winston-mongodb')
const config = require('../config/config')
const morgan = require('morgan')

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

const addLoggerMiddleware = (app) => {
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
}

module.exports = addLoggerMiddleware
