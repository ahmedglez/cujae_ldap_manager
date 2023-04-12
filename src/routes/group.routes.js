const express = require('express')
const router = express.Router()
const GroupServices = require('../services/group.services')
const { responseSuccess, responseError } = require('../schemas/response.schema')
const validateResponse = require('../middlewares/validateResponse')
const { checkAuth } = require('../middlewares/auth.handler')
const service = GroupServices()

//Get all users
router.get('/', checkAuth, validateResponse, (req, res) => {
  const branch = req.query.branch
  service
    .getAll(branch)
    .then((data) => responseSuccess(res, 'data fetched succesfully', data))
    .catch((err) => responseError(res, err.message, err.errors))
})
router.get('/admins', checkAuth, validateResponse, (req, res) => {
  const branch = req.query.branch
  service
    .getAdminsGroups(branch)
    .then((data) => responseSuccess(res, 'data fetched succesfully', data))
    .catch((err) => responseError(res, err.message, err.errors))
})

module.exports = router
