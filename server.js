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

//app initialization
const app = express()

//security middlewares
app.use(cors())
app.use(helmet())

// load app middlewares
// The order of the following middleware is very important!!
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json())
app.use(sessionMiddleWare)
addLoggerMiddleware(app)

//LDAP initialization
ldap_initialization(app)

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
