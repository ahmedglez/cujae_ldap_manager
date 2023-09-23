const UserRoutes = require('./user.routes')
const GroupRoutes = require('./group.routes')
const ProfileRoutes = require('./profile.routes')
const RecoveryPassword = require('@src/modules/passwordManagement/routes/recovery_password.routes')
const UpdatePassword = require('@src/modules/passwordManagement/routes/updated_password.routes')
const DNRoutes = require('@src/routes/dn.routes')
const LogsRoutes = require('../modules/logsManagement/routes/logs.routes')

const addRoutes = (app) => {
  app.use('/users', UserRoutes)
  app.use('/groups', GroupRoutes)
  app.use('/profile', ProfileRoutes)
  app.use('/', RecoveryPassword, UpdatePassword, DNRoutes)
  app.use('/', LogsRoutes)
}

module.exports = addRoutes
