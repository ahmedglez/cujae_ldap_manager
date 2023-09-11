const UserRoutes = require('./user.routes')
const GroupRoutes = require('./group.routes')
const ProfileRoutes = require('./profile.routes')
const LogsRoutes = require('./logs.routes')
const RecoveryPassword = require('@src/modules/forgot-password/routes/recovery_password.routes')

const addRoutes = (app) => {
  app.use('/users', UserRoutes)
  app.use('/groups', GroupRoutes)
  app.use('/profile', ProfileRoutes)
  app.use('/logs', LogsRoutes)
  app.use('/', RecoveryPassword)
}

module.exports = addRoutes
