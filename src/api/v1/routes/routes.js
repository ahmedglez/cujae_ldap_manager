const config = require('@src/config/config')
const { version } = config.api
const userController = require('@src/controllers/user.controller')
const groupController = require('@src/controllers/group.controller')
const profileController = require('@src/controllers/profile.controller')
const recoveryPasswordController = require('@src/modules/passwordManagement/controllers/recovery_password.controller')
const updatePasswordController = require('@src/modules/passwordManagement/controllers/updated_password.controller')
const dnController = require('@src/controllers/dn.controller')
const logsController = require('@src/modules/logsManagement/controllers/logs.controller')
const ldapController = require('@src/controllers/ldap.controller')

const addRoutes = (app) => {
  app.use(`/api/${version}/users`, userController)
  app.use(`/api/${version}/groups`, groupController)
  app.use(`/api/${version}/profile`, profileController)
  app.use(`/api/${version}/ldap`, ldapController)
  app.use(`/api/${version}/dn`, dnController)
  app.use(`/api/${version}/`, recoveryPasswordController)
  app.use(`/api/${version}/`, updatePasswordController)
  app.use(`/api/${version}/logs`, logsController)
}

module.exports = addRoutes
