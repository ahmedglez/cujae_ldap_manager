const express = require('express')
const router = express.Router()

const { responseSuccess, responseError } = require('../schemas/response.schema')
const { responseSuccess, responseError } = require('../schemas/response.schema')
const validateResponse = require('../middlewares/validateResponse')
const { checkAuth } = require('../middlewares/auth.handler')

const GroupServices = require('../services/group.services')
const service = GroupServices()

router.get('/:group', checkAuth, validateResponse, (req, res) => {
  service
    .getUserByGroup(req.params.group)
    .then((data) => responseSuccess(res, 'data fetched succesfully', data))
    .catch((err) => responseError(res, err.message, err.errors))
})

module.exports = router
