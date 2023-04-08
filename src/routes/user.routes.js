const express = require('express')
const router = express.Router()
const UserServices = require('../services/user.services')
const { responseSuccess, responseError } = require('../schemas/response.schema')
const validateResponse = require('../middlewares/validateResponse')
const { checkAuth } = require('../middlewares/auth.handler')
const service = UserServices()

router.get('/', checkAuth, validateResponse, (req, res) => {
  service
    .getAll()
    .then((data) => responseSuccess(res, 'data fetched succesfully', data))
    .catch((err) => responseError(res, err.message, err.errors))
})
router.get('/:username', checkAuth, validateResponse, (req, res) => {
  service
    .getByUsername(req.params.username)
    .then((data) => responseSuccess(res, 'data fetched succesfully', data))
    .catch((err) => {
      responseError(res, err.message, err.errors)
    })
})
router.get('/ci/:ci', checkAuth, validateResponse, (req, res) => {
  service
    .getByCI(req.params.ci)
    .then((data) => responseSuccess(res, 'data fetched succesfully', data))
    .catch((err) => responseError(res, err.message, err.errors))
})
router.get('/email/:email', checkAuth, validateResponse, (req, res) => {
  service
    .getByEmail(req.params.email)
    .then((data) => responseSuccess(res, 'data fetched succesfully', data))
    .catch((err) => responseError(res, err.message, err.errors))
})

module.exports = router
