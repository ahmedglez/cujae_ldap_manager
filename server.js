/* jshint node:true */
/* global require */
const CONFIG = require('./src/config/config.js')
const bodyParser = require('body-parser')
const express = require('express')
const addRoutes = require('./src/routes/routes.js')
const sessionMiddleWare = require('./src/middlewares/session.handler.js')
const addLoggerMiddleware = require('./src/middlewares/logger.handler.js')
const ldap_initialization = require('./src/utils/ldap_initialization.js')
const path = require('path')
const cors = require('cors')
const helmet = require('helmet')
const limiter = require('./src/middlewares/rate_limiter.handler.js')
const paginate = require('express-paginate')

//app initialization
const app = express()

app.use(require('express-status-monitor')())
// load app middlewares
// The order of the following middleware is very important!!
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json())

//security middlewares
app.use(cors())
app.use(helmet())
app.use(limiter)
app.use(sessionMiddleWare)
addLoggerMiddleware(app)

//LDAP and passport initialization
ldap_initialization(app)

//pagination middleware
app.use(paginate.middleware(100, CONFIG.ldap.sizeLimit))

//add routes to application
addRoutes(app)

// Configure app to require modules from "src" directory
app.set('~', path.join(__dirname, 'src'))

// serve static pages
app.use(express.static('./src/public'))

// Start server
let port = CONFIG.server.port || 4000
console.log(`server listen on port ${port}`)
app.listen(port, CONFIG.server.host || '127.0.0.1')
