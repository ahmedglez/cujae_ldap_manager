const AuthRoutes = require('./auth.routes')
const TreeRoutes = require('./tree.routes')

const addRoutes = (app) => {
  app.use('/', AuthRoutes)
  app.use('/professors', TreeRoutes)
}

module.exports = addRoutes
