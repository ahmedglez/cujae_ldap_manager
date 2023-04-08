const express = require('express')
const router = express.Router()

const { responseSuccess, responseError } = require('../schemas/response.schema')
const validateResponse = require('../middlewares/validateResponse')

const GroupServices = require('../services/group.services')
const service = GroupServices()

router.get('/:group', (req, res) => {
  service
    .getUserByGroup(req.params.group)
    .then((data) => responseSuccess(res, 'data fetched succesfully', data))
    .catch((err) => responseError(res, err.message, err.errors))
})

module.exports = router
