const express = require('express')
const router = express.Router()
const GroupServices = require('../services/group.services')
const { responseSuccess, responseError } = require('../schemas/response.schema')
const validateResponse = require('../middlewares/validateResponse')
const { checkAuth, checkRoles } = require('../middlewares/auth.handler')
const { verifyToken } = require('@src/utils/authentication/tokens/token_verify')
const config = require('@src/config/config')
const service = GroupServices()

/**
 * @openapi
 * /api/v1/groups/byName/{group}:
 *   get:
 *     tags: [Groups]
 *     summary: Get a LDAP group by its name.
 *     description: Retrieve information about an LDAP group by specifying its name in the URL path. This endpoint requires authentication to access group information.
 *     operationId: getGroupByName
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: group
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the LDAP group to retrieve.
 *     responses:
 *       200:
 *         description: LDAP group information retrieved successfully.
 *       401:
 *         description: Unauthorized. The user is not authenticated.
 *       500:
 *         description: An error occurred while fetching group information.
 */

router.get('/byName/:group', checkAuth, validateResponse, async (req, res) => {
  try {
    const payload = verifyToken(req.headers.authorization.split(' ')[1])
    const group = req.params.group

    if (!payload) {
      throw new Error(`Invalid token.`)
    }

    const baseDN = payload.roles.includes('superadmin')
      ? (req.body.baseDN = config.ldap.base)
      : payload.localBase.replace('ou=usuarios,', '')

    if (!baseDN) {
      throw new Error(`Invalid token.`)
    }

    const response = await service.getGroup(group)

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

/**
 * @openapi
 * /api/v1/groups:
 *   post:
 *     tags: [Groups]
 *     summary: Get LDAP groups.
 *     description: Retrieve a list of LDAP groups based on specified parameters. This endpoint requires authentication to access group information.
 *     operationId: getGroups
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: scope
 *         schema:
 *           type: string
 *         description: The scope of the LDAP search operation (default: 'sub').
 *       - in: body
 *         name: baseDN
 *         required: false
 *         description: The base DN (Distinguished Name) for the LDAP search (default: 'dc=cu').
 *         schema:
 *           type: object
 *           properties:
 *             baseDN:
 *               type: string
 *     responses:
 *       200:
 *         description: List of LDAP groups retrieved successfully.
 *       401:
 *         description: Unauthorized. The user is not authenticated.
 *       500:
 *         description: An error occurred while fetching group information.
 */

router.post('/', checkAuth, validateResponse, async (req, res) => {
  try {
    const { baseDN = 'dc=cu' } = req.body
    const { scope = 'sub' } = req.query

    const ldapFilter = `(&(objectClass=organizationalUnit))`

    if (!baseDN) {
      throw new Error(`Invalid token.`)
    }

    const response = await service.getGroups(baseDN, ldapFilter, scope)

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

/**
 * @openapi
 * /api/v1/groups/getChilds:
 *   post:
 *     tags: [Groups]
 *     summary: Get child groups of a specified base DN.
 *     description: Retrieve child groups of a specified base DN. This endpoint is restricted to administrators and requires authentication.
 *     operationId: getChildGroups
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: body
 *         name: baseDN
 *         required: true
 *         description: The base DN (Distinguished Name) for which to retrieve child groups.
 *         schema:
 *           type: object
 *           properties:
 *             baseDN:
 *               type: string
 *     responses:
 *       200:
 *         description: Child groups retrieved successfully.
 *       401:
 *         description: Unauthorized. The user is not authenticated.
 *       403:
 *         description: Forbidden. The user does not have sufficient privileges to access this endpoint.
 *       500:
 *         description: An error occurred while fetching child groups.
 */

router.post('/getChilds', checkAuth, checkRoles('admin'), async (req, res) => {
  try {
    const { baseDN } = req.body

    if (!baseDN) {
      throw new Error(`Base DN requerido.`)
    }
    const response = await service.getChildrensBaseDN(baseDN)
    res.json({
      success: true,
      data: response,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: 'Parece que el grupo seleccionado no existe o se encuentra vacío',
      error: error,
    })
  }
})

/**
 * @openapi
 * /api/v1/groups/byType/{type}:
 *   post:
 *     tags: [Groups]
 *     summary: Get a group by type.
 *     description: Retrieve a group by its type using the specified DN. This endpoint requires authentication.
 *     operationId: getGroupByType
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         description: The type of the group to retrieve.
 *         schema:
 *           type: string
 *       - in: body
 *         name: dn
 *         description: The DN (Distinguished Name) to search for the group.
 *         schema:
 *           type: object
 *           properties:
 *             dn:
 *               type: string
 *     responses:
 *       200:
 *         description: Group retrieved successfully by type.
 *       401:
 *         description: Unauthorized. The user is not authenticated.
 *       500:
 *         description: An error occurred while fetching the group by type.
 */

router.post('/byType/:type', checkAuth, validateResponse, async (req, res) => {
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
