const express = require('express')
const router = express.Router()
const { searchByDN } = require('../services/dn.services')
const { responseSuccess, responseError } = require('../schemas/response.schema')
const validateResponse = require('../middlewares/validateResponse')
const { checkAuth, checkRoles } = require('../middlewares/auth.handler')
const { verifyToken } = require('@src/utils/authentication/tokens/token_verify')
const config = require('@src/config/config')

/**
 * @openapi
 * /api/v1/searchByDN:
 *   get:
 *     tags: [DN]
 *     summary: Search by Distinguished Name (DN).
 *     description: Retrieve information by providing a Distinguished Name (DN).
 *     operationId: searchByDN
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: baseDN
 *         required: true
 *         schema:
 *           type: string
 *         description: The Distinguished Name (DN) to search for.
 *     responses:
 *       200:
 *         description: Successfully retrieved information.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LDAPResponse'
 *       400:
 *         description: Bad Request. Base DN is missing.
 *       401:
 *         description: Unauthorized. Requires admin role.
 *       500:
 *         description: Internal Server Error. Failed to fetch information.
 */

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
