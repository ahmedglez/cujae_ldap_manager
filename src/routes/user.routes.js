const express = require('express')
const router = express.Router()
const UserServices = require('../services/user.services')
const { responseSuccess, responseError } = require('../schemas/response.schema')
const validateResponse = require('../middlewares/validateResponse')
const { checkAuth } = require('../middlewares/auth.handler')
const service = UserServices()

//Get all users
router.get('/', checkAuth, validateResponse, (req, res) => {
  const page = req.query.page || undefined
  const branch = req.query.branch || undefined
  service
    .getAll(page, branch)
    .then((data) => responseSuccess(res, 'data fetched succesfully', data))
    .catch((err) => responseError(res, err.message, err.errors))
})
//Get students
router.get('/students', checkAuth, validateResponse, (req, res) => {
  const page = req.query.page || undefined
  const branch = req.query.branch || undefined
  const group = req.query.group || undefined
  service
    .getStudents(page, branch, group)
    .then((data) => responseSuccess(res, 'data fetched succesfully', data))
    .catch((err) => responseError(res, err.message, err.errors))
})
//Get professors
router.get('/professors', checkAuth, validateResponse, (req, res) => {
  const page = req.query.page || undefined
  const branch = req.query.branch || undefined
  const orgRole = req.query.orgRole || undefined
  const PCC = req.query.PCC || undefined
  const researchGroup = req.query.researchGroup || undefined
  service
    .getProfessors(page, branch, orgRole, PCC, researchGroup)
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
