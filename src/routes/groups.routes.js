const express = require('express')
const router = express.Router()
const { responseSuccess, responseError } = require('../schemas/response.schema')
const validateResponse = require('../middlewares/validateResponse')
const { checkAuth } = require('../middlewares/auth.handler')

const GroupServices = require('../services/group.services')
const service = GroupServices()

router.get('/:group', checkAuth, validateResponse, (req, res) => {
  const group = req.params.group
  const branch = req.query.branch
  service
    .getAll(group, branch)
    .then((data) => responseSuccess(res, 'data fetched succesfully', data))
    .catch((err) => responseError(res, err.message, err.errors))
})

module.exports = router
