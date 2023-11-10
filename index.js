/* jshint node:true */
/* global require */
require('module-alias/register')
const bodyParser = require('body-parser')
const express = require('express')

const path = require('path')
const cors = require('cors')
const helmet = require('helmet')
const paginate = require('express-paginate')
const compression = require('compression')
const cache = require('express-cache-ctrl')

const CONFIG = require('@src/config/config.js')
const logger = require('@src/utils/logger')
const limiter = require('@src/middlewares/rate_limiter.handler.js')
const addRoutes = require('@src/api/v1/routes/routes.js')
const sessionMiddleWare = require('@src/middlewares/session.handler.js')
const addLoggerMiddleware = require('@src/middlewares/morganMiddleware')
const ldap_initialization = require('@src/utils/ldap_initialization.js')
const { swaggerDocs: v1SwaggerDocs } = require('@src/api/v1/swagger.js')

//app initialization
const app = express()

app.use(require('express-status-monitor')())
// load app middlewares
// The order of the following middleware is very important!!
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json())

// Middleware para la compresión de respuestas
app.use(compression())

//security middlewares
app.use(
  cors({
    origin: '*',
  })
)

/* 
const whitelist = ['http://developer1.com', 'http://developer2.com']
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error())
    }
  }
}
*/

app.use(helmet())
// Middleware para limitar el numero de solicitudes
app.use(limiter)
// Middleware para el registro de solicitudes
app.use(sessionMiddleWare)
addLoggerMiddleware(app)

//LDAP and passport initialization
ldap_initialization(app)

//pagination middleware
app.use(paginate.middleware(100, CONFIG.ldap.sizeLimit))

// Middleware de caché
app.use(cache.private(3600))

//add routes to application
addRoutes(app)

// Configure app to require modules from "src" directory
app.set('~', path.join(__dirname, 'src'))

// serve static pages
app.use(express.static('./src/public'))

// Start server
let PORT = CONFIG.server.port || 4000
app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`)
  v1SwaggerDocs(app, PORT)
})

module.exports = app
