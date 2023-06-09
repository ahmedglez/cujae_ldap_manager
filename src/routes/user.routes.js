const express = require('express')
const router = express.Router()
const UserServices = require('../services/user.services')
const { responseSuccess, responseError } = require('../schemas/response.schema')
const validateResponse = require('../middlewares/validateResponse')
const { checkAuth, checkRoles } = require('../middlewares/auth.handler')
const service = UserServices()
const paginateResults = require('../utils/paginateResults')
const newUserSchema = require('../schemas/newUser.schema')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
// test
const Person = mongoose.model(
  'Person',
  Schema({
    name: String,
    email: String,
    password: String,
  })
)

router.post('/artillery', async (req, res) => {
  const user = req.body
  const person = Person({
    name: user.name,
    email: user.email,
    password: user.password,
  })

  await person.save()
  res.status(200).json({
    success: true,
    message: 'user added',
    data: user,
  })
})

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
  checkRoles('admino'),
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

//Add Users
router.post(
  '/',
  checkAuth,
  checkRoles('admin'),
  validateResponse,
  (req, res) => {
    const user = req.body
    const branch = req.query.branch || undefined
    if (!branch) {
      responseError(res, 'branch is required')
    }
    newUserSchema
      .validate(user)
      .then(() => {
        service
          .addNewUser(user, branch)
          .then((data) => responseSuccess(res, 'user added succesfully', data))
          .catch((err) => responseError(res, err.message, err.errors))
      })
      .catch((err) => responseError(res, err.message, err.errors))
  }
)

module.exports = router
