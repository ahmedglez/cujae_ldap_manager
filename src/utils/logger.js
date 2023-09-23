const winston = require('winston')
const { MongoDB } = require('winston-mongodb')
const config = require('@src/config/config')

const level = () => {
  const env = process.env.NODE_ENV || 'development'
  const isDevelopment = env === 'development'
  return isDevelopment ? 'debug' : 'warn'
}

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
}

winston.addColors(colors)

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
)

const transports = [
  new winston.transports.Console({}),
  new winston.transports.File({ filename: 'logs/all.log', level: 'error' }),
  new winston.transports.File({ filename: 'logs/all.log' }),
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
]

const logger = winston.createLogger({
  level: 'info',
  format: format,
  transports: transports,
})

module.exports = logger
