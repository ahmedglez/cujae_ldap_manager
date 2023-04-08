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

router.get('/estudiantes', checkAuth, validateResponse, (req, res) => {
  service
    .getAllStudents()
    .then((data) => responseSuccess(res, 'data fetched succesfully', data))
    .catch((err) => responseError(res, err.message, err.errors))
})
router.get('/profesores', checkAuth, validateResponse, (req, res) => {
  service
    .getAllProffesors()
    .then((data) => responseSuccess(res, 'data fetched succesfully', data))
    .catch((err) => responseError(res, err.message, err.errors))
})
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
//get students by year and branch
router.get('/estudiantes/', checkAuth, validateResponse, (req, res) => {
  const year = req.query.year
  const branch = req.query.branch
  service
    .getUsersByYearAndBranch(year, branch, STUDENT_CLASS)
    .then((data) => responseSuccess(res, 'data fetched succesfully', data))
    .catch((err) => responseError(res, err.message, err.errors))
})
//get professors by year and branch
router.get('/profesores/', checkAuth, validateResponse, (req, res) => {
  const year = req.query.year
  const branch = req.query.branch
  service
    .getUsersByYearAndBranch(year, branch, PROFESSORS_CLASS)
    .then((data) => responseSuccess(res, 'data fetched succesfully', data))
    .catch((err) => responseError(res, err.message, err.errors))
})

module.exports = router
