const express = require('express')
const router = express.Router()
const { searchByDN } = require('../services/dn.services')
const { responseSuccess, responseError } = require('../schemas/response.schema')
const validateResponse = require('../middlewares/validateResponse')
const { checkAuth, checkRoles } = require('../middlewares/auth.handler')
const { verifyToken } = require('@src/utils/authentication/tokens/token_verify')
const config = require('@src/config/config')

router.get(
  '/searchByDN',
  checkAuth,
  checkRoles('admin'),
  validateResponse,
  async (req, res) => {
    try {
      const { baseDN } = req.body

      if (baseDN === undefined) {
        throw new Error(`Base DN required.`)
      }

      const response = await searchByDN(baseDN)

      res.json({
        success: true,
        data: response,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching group',
        error: error.message,
      })
    }
  }
)

module.exports = router
