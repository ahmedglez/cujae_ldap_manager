const boom = require('@hapi/boom')
const ldap = require('../connections/LDAP_client')
const config = require('../config/config')

const PROFESSORS_CLASS = config.ldap.objectClasses[0]

const TreeServices = () => {
  const getAllProffesors = async (req, res, next) => {
    const filter = `(objectclass=${PROFESSORS_CLASS})`
    const attributes = ['uid', 'displayName', 'CI']
    const search_options = {
      base: config.ldap.base,
      scope: 0,
      filter: filter,
      attrs: attributes,
    }

    const response = await ldap.search(search_options, (err, data) => {
      if (err) {
        console.log('ERROR EN BUSQUEDA', err)
        res.send({
          success: 'false',
          message: err.message,
        })
      }
      res.send({
        success: 'true',
        message: 'all professors',
        data: data,
      })
    })

    return response
  }

  return {
    getAllProffesors,
  }
}

module.exports = TreeServices
