const AuthRoutes = require('./auth.routes')

const addRoutes = (app) => {
  app.use('/', AuthRoutes)
}

module.exports = addRoutes
