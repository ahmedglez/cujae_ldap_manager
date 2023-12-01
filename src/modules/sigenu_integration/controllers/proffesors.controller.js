const express = require('express')
const router = express.Router()
const UserServices = require('@src/services/user.services.js')
const { basicAuth } = require('@src/middlewares/basicAuth.handler')
const service = UserServices()
const config = require('@src/config/config')

const {
  validateAttributes,
} = require('@src/modules/sigenu_integration/helpers/validation.helper')
const {
  createProfessorsFilter,
  parseLdapEntryToProfessorDto,
} = require('@src/modules/sigenu_integration/helpers/sigenu.helper')

router.use(basicAuth)

const BASE_ROUTE = '/professors'
const USER_TYPE = 'Trabajador Docente'
const LIMIT = 100000
const PAGE = 1
router.post(`${BASE_ROUTE}/`, async (req, res) => {
  try {
    const { roles, localBase } = req.user
    const queryJson = req.body
    const requiredAttributes = [
      'identification',
      'name',
      'lastname',
      'surname',
      'email',
    ]
    // Validate the attributes
    validateAttributes(queryJson, requiredAttributes)
    const queryFilter = createProfessorsFilter(queryJson)
    const ldapFilter = `(&(objectClass=person)(userType=${USER_TYPE})${queryFilter})`

    const attributes = null
    console.log('roles', roles)
    console.log('ldapFilter', ldapFilter)

    // Call the performLdapSearch function to retrieve users matching the group filters
    const searchResults = await service.handleFilteredSearch(
      roles.includes('superadmin') ? config.ldap.base : localBase,
      ldapFilter,
      attributes,
      PAGE,
      LIMIT
    )

    console.log('searchResults', searchResults)

    const parsedResults = parseLdapEntryToProfessorDto(searchResults)

    console.log('parsedResults', parsedResults)

    res.status(200).json(parsedResults)
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Invalid request body',
      error: error.message,
    })
  }
})

module.exports = router
