const express = require('express')
const router = express.Router()
const config = require('../config/config')
const { responseSuccess, responseError } = require('../schemas/response.schema')
const validateResponse = require('../middlewares/validateResponse')
const { checkAuth } = require('../middlewares/auth.handler')

const TreeServices = require('../services/tree.services')
const service = TreeServices()

const PROFESSORS_CLASS = config.ldap.objectClasses[5].name
const STUDENT_CLASS = config.ldap.objectClasses[3].name

router.get('/year/:year', checkAuth, validateResponse, (req, res) => {
  service
    .getUsersByYear(req.params.year)
    .then((data) => responseSuccess(res, 'data fetched succesfully', data))
    .catch((err) => responseError(res, err.message, err.errors))
})
router.get('/branch/:branch', checkAuth, validateResponse, (req, res) => {
  service
    .getUserByBranch(req.params.branch)
    .then((data) => responseSuccess(res, 'data fetched succesfully', data))
    .catch((err) => responseError(res, err.message, err.errors))
})

module.exports = router
