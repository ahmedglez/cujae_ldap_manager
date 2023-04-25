const express = require('express')
const router = express.Router()
const UserServices = require('../services/user.services')
const { responseSuccess, responseError } = require('../schemas/response.schema')
const validateResponse = require('../middlewares/validateResponse')
const { checkAuth, checkRoles } = require('../middlewares/auth.handler')
const service = UserServices()
const paginateResults = require('../utils/paginateResults')

//Get all users
router.get(
  '/',
  checkAuth,
  checkRoles('admin'),
  validateResponse,
  (req, res) => {
    const branch = req.query.branch || undefined
    service
      .getAll(branch)
      .then((data) =>
        responseSuccess(
          res,
          'data fetched succesfully',
          paginateResults(data, req)
        )
      )
      .catch((err) => responseError(res, err.message, err.errors))
  }
)
//Get students
router.get(
  '/students',
  checkAuth,
  checkRoles('admin'),
  validateResponse,
  (req, res) => {
    const branch = req.query.branch || undefined
    const group = req.query.group || undefined
    const year = req.query.year || undefined
    service
      .getStudents(branch, group, year)
      .then((data) =>
        responseSuccess(
          res,
          'data fetched succesfully',
          paginateResults(data, req)
        )
      )
      .catch((err) => responseError(res, err.message, err.errors))
  }
)
//Get professors
router.get(
  '/professors',
  checkAuth,
  checkRoles('admin'),
  validateResponse,
  (req, res) => {
    const page = req.query.page || undefined
    const branch = req.query.branch || undefined
    const orgRole = req.query.orgRole || undefined
    const PCC = req.query.PCC || undefined
    const researchGroup = req.query.researchGroup || undefined
    service
      .getProfessors(page, branch, orgRole, PCC, researchGroup)
      .then((data) => responseSuccess(res, 'data fetched succesfully', data))
      .catch((err) => responseError(res, err.message, err.errors))
  }
)
router.get(
  '/:username',
  checkAuth,
  checkRoles('admin'),
  validateResponse,
  (req, res) => {
    service
      .getByUsername(req.params.username)
      .then((data) =>
        responseSuccess(
          res,
          'data fetched succesfully',
          paginateResults(data, req)
        )
      )
      .catch((err) => {
        responseError(res, err.message, err.errors)
      })
  }
)
router.get(
  '/ci/:ci',
  checkAuth,
  checkRoles('admin'),
  validateResponse,
  (req, res) => {
    service
      .getByCI(req.params.ci)
      .then((data) => responseSuccess(res, 'data fetched succesfully', data))
      .catch((err) => responseError(res, err.message, err.errors))
  }
)
router.get(
  '/email/:email',
  checkAuth,
  checkRoles('admin'),
  validateResponse,
  (req, res) => {
    service
      .getByEmail(req.params.email)
      .then((data) => responseSuccess(res, 'data fetched succesfully', data))
      .catch((err) => responseError(res, err.message, err.errors))
  }
)

module.exports = router
