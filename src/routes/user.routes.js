const express = require('express')
const router = express.Router()
const UserServices = require('@src/services/user.services.js')
const {
  responseSuccess,
  responseError,
} = require('@src/schemas/response.schema')
const validateResponse = require('@src/middlewares/validateResponse')
const { checkAuth, checkRoles } = require('@src/middlewares/auth.handler')
const service = UserServices()
const paginateResults = require('@src/utils/paginateResults')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const getQueryToFilters = require('@src/utils/getQueryToFilters')
const { performLdapSearch } = require('@src/helpers/ldapUtils')
const config = require('@src/config/config')
const paginate = require('express-paginate')
const {
  createLdapFilterFromQuery,
} = require('@src/helpers/convertQueryToFilter')

// Middleware for routes requiring checkAuth and checkRoles('admin')
router.use(checkAuth, checkRoles('admin'))

// Middleware to handle common success and error responses
router.use(validateResponse)

// Route handler for getting all users
router.get('/', async (req, res) => {
  try {
    const baseDN = `${config.ldap.base}`
    const queryFilter = createLdapFilterFromQuery(req.query)
    const ldapFilter = `(&(objectClass=person)${queryFilter})`

    console.log('queryFilter', queryFilter)
    console.log('ldapFilter', ldapFilter)

    // Define the LDAP attributes you want to retrieve
    const attributes = [
      'uid',
      'cn',
      'sn',
      'givenName',
      'mail',
      'telephoneNumber',
    ]

    // Call the performLdapSearch function to retrieve users matching the group filters
    const searchResults = await service.handleFilteredSearch(
      baseDN,
      ldapFilter,
      attributes,
      req.query.page,
      req.query.limit
    )
    // Send the search results
    res.json({
      success: true,
      length: searchResults.length,
      data: searchResults,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message,
    })
  }
})

// Get users by groups
router.get('/group/:group', async (req, res) => {
  try {
    const baseDN = `ou=usuarios,ou=${req.params.group},${config.ldap.base}`
    const filter = 'objectClass=person'

    // Define the LDAP attributes you want to retrieve
    const attributes = [
      'uid',
      'cn',
      'sn',
      'givenName',
      'mail',
      'telephoneNumber',
    ]

    // Call the performLdapSearch function to retrieve users matching the group filters
    const searchResults = await service.handleFilteredSearch(
      baseDN,
      filter,
      attributes,
      req.query.page,
      req.query.limit
    )
    // Send the search results
    res.json({
      success: true,
      length: searchResults.length,
      data: searchResults,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message,
    })
  }
})

// Route handler for getting user by username
router.get('/:username', (req, res) => {
  service
    .getByUsername(req.params.username)
    .then((data) => responseSuccess(res, 'data fetched successfully', data))
    .catch((err) => responseError(res, err.message, err.errors))
})

// Route handler for getting user by CI
router.get('/ci/:ci', (req, res) => {
  service
    .getByCI(req.params.ci)
    .then((data) => responseSuccess(res, 'data fetched successfully', data))
    .catch((err) => responseError(res, err.message, err.errors))
})

// Route handler for getting user by email
router.get('/email/:email', (req, res) => {
  service
    .getByEmail(req.params.email)
    .then((data) => responseSuccess(res, 'data fetched successfully', data))
    .catch((err) => responseError(res, err.message, err.errors))
})

// Route handler for getting users by year
router.get('/year/:year', (req, res) => {
  const branch = req.query.branch
  service
    .getByYear(req.params.year, branch)
    .then((data) =>
      responseSuccess(
        res,
        'data fetched successfully',
        paginateResults(data, req)
      )
    )
    .catch((err) => responseError(res, err.message, err.errors))
})

module.exports = router
