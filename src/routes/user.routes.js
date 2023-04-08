const express = require('express')
const router = express.Router()
const UserServices = require('../services/user.services')
const { responseSuccess, responseError } = require('../schemas/response.schema')
const validateResponse = require('../middlewares/validateResponse')
const service = UserServices()

router.get('/', (req, res) => {
  service
    .getAll()
    .then((data) => responseSuccess(res, 'data fetched succesfully', data))
    .catch((err) => responseError(res, err.message, err.errors))
})
router.get('/:username', validateResponse, (req, res) => {
  service
    .getByUsername(req.params.username)
    .then((data) => responseSuccess(res, 'data fetched succesfully', data))
    .catch((err) => {
      responseError(res, err.message, err.errors)
    })
})
router.get('/ci/:ci', validateResponse, (req, res) => {
  service
    .getByCI(req.params.ci)
    .then((data) => responseSuccess(res, 'data fetched succesfully', data))
    .catch((err) => responseError(res, err.message, err.errors))
})
router.get('/email/:email', (req, res) => {
  service
    .getByEmail(req.params.email)
    .then((data) => responseSuccess(res, 'data fetched succesfully', data))
    .catch((err) => responseError(res, err.message, err.errors))
})

module.exports = router
