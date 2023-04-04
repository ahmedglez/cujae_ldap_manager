const express = require('express')
const router = express.Router()

const TreeServices = require('../services/tree.services')
const service = TreeServices()

router.get('/', service.getAllProffesors)

module.exports = router
