const winston = require('winston')
const { MongoDB } = require('winston-mongodb')
const config = require('../config/config')

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

module.exports = logger
