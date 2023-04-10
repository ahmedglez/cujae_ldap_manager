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

module.exports = router
