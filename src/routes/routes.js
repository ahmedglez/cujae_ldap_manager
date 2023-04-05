const AuthRoutes = require('./auth.routes')
const TreeRoutes = require('./tree.routes')
const UserRoutes = require('./user.routes')

const addRoutes = (app) => {
  app.use('/', AuthRoutes)
  app.use('/tree', TreeRoutes)
  app.use('/users', UserRoutes)
}

module.exports = addRoutes
