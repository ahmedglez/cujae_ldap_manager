const express = require('express')
const router = express.Router()
const ProfileServices = require('../services/profile.services')
const { responseSuccess, responseError } = require('../schemas/response.schema')
const validateResponse = require('../middlewares/validateResponse')
const { checkAuth, checkRoles } = require('../middlewares/auth.handler')
const service = ProfileServices()

//Get all users
router.get('/', checkAuth, checkRoles('user'), validateResponse, (req, res) => {
  service
    .getProfile(req)
    .then((data) => responseSuccess(res, 'data fetched succesfully', data))
    .catch((err) => responseError(res, err.message, err.errors))
})

router.put('/', checkAuth, checkRoles('user'), validateResponse, (req, res) => {
  const { email, password, confirmPassword } = req.body
  if (!email && !password) {
    console.log('entro')
    responseError(res, 'fields cannot be empty', null)
  } else if (password) {
    if (password !== confirmPassword) {
      responseError(res, 'passwords must be the same')
    }
  } else {
    service
      .updateProfile(email, password, req)
      .then((data) => responseSuccess(res, 'data fetched succesfully', data))
      .catch((err) => responseError(res, err.message, err.errors))
  }
})

module.exports = router
