const config = require('@src/config/config')
const { version } = config.api
const professorsController = require('@src/modules/sigenu_integration/controllers/proffesors.controller')

const BASE_ROUTE = '/sigenu'

const addRoutes = (app) => {
  app.use(`/api/${version}${BASE_ROUTE}`, professorsController)
}

module.exports = addRoutes
