const express = require('express')
const LogService = require('../services/logs.services')
const router = express.Router()
const { responseSuccess, responseError } = require('../schemas/response.schema')
const validateResponse = require('../middlewares/validateResponse')
const { checkAuth, checkRoles } = require('../middlewares/auth.handler')

// Controller function to get logs filtered by method, url, status, and user
router.get(
  '/',
  checkAuth,
  checkRoles('user'),
  validateResponse,
  async (req, res) => {
    try {
      const filters = {
        method: req.query.method,
        url: req.query.url,
        status: req.query.status,
        user: req.query.user,
      }
      const logs = await LogService.filterLogs(filters)
      res.json(logs)
    } catch (error) {
      console.error('Error fetching filtered logs:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }
)

module.exports = router
