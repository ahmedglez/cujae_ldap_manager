const express = require('express')
const router = express.Router()
const GroupServices = require('../services/group.services')
const { responseSuccess, responseError } = require('../schemas/response.schema')
const validateResponse = require('../middlewares/validateResponse')
const { checkAuth, checkRoles } = require('../middlewares/auth.handler')
const { verifyToken } = require('@src/utils/authentication/tokens/token_verify')
const config = require('@src/config/config')
const service = GroupServices()
const { nodeTypes } = require('@src/constants/nodeTypes')

router.get('/', checkAuth, validateResponse, async (req, res) => {
  try {
    const payload = verifyToken(req.headers.authorization.split(' ')[1])

    if (!payload) {
      throw new Error(`Invalid token.`)
    }

    const baseDN = payload.roles.includes('superadmin')
      ? (req.body.baseDN = config.ldap.base)
      : payload.localBase.replace('ou=usuarios,', '')

    if (!baseDN) {
      throw new Error(`Invalid token.`)
    }

    const response = await service.getGroupsInBaseDN(baseDN)

    res.json({
      success: true,
      data: response,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching group',
      error: `It seems that the group does not exist.`,
    })
  }
})

router.get(
  '/getChilds/:nodeType',
  checkAuth,
  checkRoles('admin'),
  validateResponse,
  async (req, res) => {
    try {
      const nodeType = req.params.nodeType
      const baseDN = req

      if (!nodeTypes.includes(nodeType)) {
        throw new Error(`Invalid node type.`)
      }

      if (nodeType === nodeTypes[0]) {
        const response = await service.getGroupsInBaseDN(baseDN)
        res.json({
          success: true,
          data: response,
        })
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching group',
        error: `It seems that the group does not exist.`,
      })
    }
  }
)
router.get('/byType/:type', checkAuth, validateResponse, async (req, res) => {
  try {
    const type = req.params.type
    const baseDN = req.body.dn
    if (!type) {
      throw new Error(`It seems that the type is missing.`)
    }

    const response = await service.getGroupByCN(baseDN, type)

    res.json({
      success: true,
      data: response,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching group',
      error: `It seems that the group does not exist.`,
    })
  }
})

module.exports = router
