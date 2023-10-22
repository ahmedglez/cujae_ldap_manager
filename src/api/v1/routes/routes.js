const userController = require('@src/controllers/user.controller')
const groupController = require('@src/controllers/group.controller')
const profileController = require('@src/controllers/profile.controller')
const recoveryPasswordController = require('@src/modules/passwordManagement/controllers/recovery_password.controller')
const updatePasswordController = require('@src/modules/passwordManagement/controllers/updated_password.controller')
const dnController = require('@src/controllers/dn.controller')
const logsController = require('@src/modules/logsManagement/controllers/logs.controller')

const addRoutes = (app) => {
  app.use('/api/v1/users', userController)
  app.use('/api/v1/groups', groupController)
  app.use('/api/v1/profile', profileController)
  app.use('/api/v1/recovery-password', recoveryPasswordController)
  app.use('/api/v1/update-password', updatePasswordController)
  app.use('/api/v1/dn', dnController)
  app.use('/api/v1/logs', logsController)
}

module.exports = addRoutes
