const express = require('express')
const router = express.Router()
const UserServices = require('@src/services/user.services.js')
const { checkAuth, checkRoles } = require('@src/middlewares/auth.handler')
const service = UserServices()
const config = require('@src/config/config')
const {
  createLdapFilterFromQuery,
} = require('@src/helpers/convertQueryToFilter')
const validateQuery = require('@src/middlewares/queryValidator')
const ldap = require('ldapjs')
const ldapClient = require('@src/connections/LDAP_client')

router.use(checkAuth, checkRoles('admin'))

/**
 * @openapi
 * /api/v1/users:
 *   get:
 *     tags: [Users]
 *     summary: Get a list of users.
 *     description: Retrieve a list of users based on query parameters. You can filter the results by providing one or more of the following query parameters.
 *     operationId: getUsers
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of items per page.
 *       - in: query
 *         name: uid
 *         schema:
 *           type: string
 *         description: Filter users by UID.
 *       - in: query
 *         name: cn
 *         schema:
 *           type: string
 *         description: Filter users by CN.
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         description: Filter users by username.
 *       - in: query
 *         name: CI
 *         schema:
 *           type: string
 *         description: Filter users by CI.
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filter users by email.
 *       - in: query
 *         name: lastName
 *         schema:
 *           type: string
 *         description: Filter users by last name.
 *       - in: query
 *         name: sex
 *         schema:
 *           type: string
 *         description: Filter users by sex.
 *       - in: query
 *         name: area
 *         schema:
 *           type: string
 *         description: Filter users by area.
 *       - in: query
 *         name: userCondition
 *         schema:
 *           type: string
 *         description: Filter users by condition.
 *       - in: query
 *         name: userStatus
 *         schema:
 *           type: string
 *         description: Filter users by status.
 *       - in: query
 *         name: sedeMunicipio
 *         schema:
 *           type: string
 *         description: Filter users by municipality.
 *       - in: query
 *         name: userInformation
 *         schema:
 *           type: string
 *         description: Filter users by information.
 *       - in: query
 *         name: career
 *         schema:
 *           type: string
 *         description: Filter users by career.
 *       - in: query
 *         name: studentClassGroup
 *         schema:
 *           type: string
 *         description: Filter users by class group.
 *       - in: query
 *         name: studentYear
 *         schema:
 *           type: string
 *         description: Filter users by student year.
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Filter users by country.
 *       - in: query
 *         name: UJC
 *         schema:
 *           type: string
 *         description: Filter users by UJC.
 *       - in: query
 *         name: skinColor
 *         schema:
 *           type: string
 *         description: Filter users by skin color.
 *       - in: query
 *         name: sn
 *         schema:
 *           type: string
 *         description: Filter users by SN.
 *       - in: query
 *         name: displayName
 *         schema:
 *           type: string
 *         description: Filter users by display name.
 *       - in: query
 *         name: mail
 *         schema:
 *           type: string
 *         description: Filter users by mail.
 *       - in: query
 *         name: maildrop
 *         schema:
 *           type: string
 *         description: Filter users by maildrop.
 *       - in: query
 *         name: objectName
 *         schema:
 *           type: string
 *         description: Filter users by object name.
 *       - in: query
 *         name: dn
 *         schema:
 *           type: string
 *         description: Filter users by DN.
 *       - in: query
 *         name: workerID
 *         schema:
 *           type: string
 *         description: Filter users by worker ID.
 *       - in: query
 *         name: workArea
 *         schema:
 *           type: string
 *         description: Filter users by work area.
 *       - in: query
 *         name: nameInstitution
 *         schema:
 *           type: string
 *         description: Filter users by institution name.
 *       - in: query
 *         name: workercontract
 *         schema:
 *           type: string
 *         description: Filter users by worker contract.
 *       - in: query
 *         name: userYears
 *         schema:
 *           type: string
 *         description: Filter users by years of service.
 *       - in: query
 *         name: schoolLevel
 *         schema:
 *           type: string
 *         description: Filter users by school level.
 *       - in: query
 *         name: orgRole
 *         schema:
 *           type: string
 *         description: Filter users by organizational role.
 *       - in: query
 *         name: educationalCategory
 *         schema:
 *           type: string
 *         description: Filter users by educational category.
 *       - in: query
 *         name: scientificCategory
 *         schema:
 *           type: string
 *         description: Filter users by scientific category.
 *       - in: query
 *         name: ou
 *         schema:
 *           type: string
 *         description: Filter users by organizational unit.
 *     responses:
 *       200:
 *         description: A list of users.
 *       500:
 *         description: An error occurred.
 */
router.get('/', async (req, res) => {
  try {
    const { localBase, roles } = req.user
    const isValid = validateQuery(req.query)
    const queryFilter = createLdapFilterFromQuery(req.query)
    const ldapFilter = `(&(objectClass=person)${queryFilter})`

    console.log('ldapFilter', ldapFilter)

    // Define the LDAP attributes you want to retrieve
    const attributes = null

    // Call the performLdapSearch function to retrieve users matching the group filters
    const searchResults = await service.handleFilteredSearch(
      roles.includes('superadmin') ? config.ldap.base : localBase,
      ldapFilter,
      attributes,
      req.query.page,
      req.query.limit
    )

    // Send the search results
    res.status(200).json({
      success: true,
      message: 'List of users retrieved successfully',
      data: searchResults,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message,
    })
  }
})

/**
 * @openapi
 * /api/v1/group/{group}:
 *   get:
 *     tags: [Users]
 *     summary: Get a list of users in a specific group.
 *     description: Retrieve a list of users in the specified group based on query parameters.
 *     parameters:
 *       - in: path
 *         name: group
 *         required: true
 *         schema:
 *           type: string
 *         description: The group name for which to retrieve users.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of items per page.
 *     responses:
 *       200:
 *         description: A list of users in the group.
 *       500:
 *         description: An error occurred.
 */
router.get('/group/:group', async (req, res) => {
  try {
    const baseDN = `ou=usuarios,ou=${req.params.group},${config.ldap.base}`
    const isValid = validateQuery(req.query)
    const queryFilter = createLdapFilterFromQuery(req.query)
    const ldapFilter = `(&(objectClass=person)${queryFilter})`

    // Define the LDAP attributes you want to retrieve
    const attributes = [
      'uid',
      'cn',
      'sn',
      'givenName',
      'mail',
      'telephoneNumber',
    ]

    // Call the performLdapSearch function to retrieve users matching the group filters
    const searchResults = await service.handleFilteredSearch(
      baseDN,
      ldapFilter,
      attributes,
      req.query.page,
      req.query.limit
    )
    // Send the search results
    res.json({
      success: true,
      length: searchResults.length,
      data: searchResults,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message,
    })
  }
})

/**
 * @openapi
 * /api/v1/users/baseDN:
 *   post:
 *     tags: [Users]
 *     summary: Get a list of users based on a custom baseDN.
 *     description: Retrieve a list of users based on a custom baseDN. You can specify the baseDN in the request body to filter the results. Optionally, you can provide additional query parameters to further refine the search.
 *     operationId: getUsersByBaseDN
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               baseDN:
 *                 type: string
 *                 description: The custom baseDN to search for users.
 *                 example: "ou=example,dc=example,dc=com"
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of items per page.
 *     responses:
 *       200:
 *         description: A list of users based on the custom baseDN.
 *       400:
 *         description: Bad request. The `baseDN` parameter is missing in the request body.
 *       500:
 *         description: An error occurred.
 */
router.post('/baseDN', async (req, res) => {
  try {
    const baseDN = req.body.baseDN
    if (!baseDN) {
      throw new Error('Value of the baseDN has not been sent correctly')
    }
    const isValid = validateQuery(req.query)
    const queryFilter = createLdapFilterFromQuery(req.query)
    const ldapFilter = `(&(objectClass=person)${queryFilter})`

    // Define the LDAP attributes you want to retrieve
    const attributes = null

    // Call the performLdapSearch function to retrieve users matching the group filters
    const searchResults = await service.handleFilteredSearch(
      baseDN,
      ldapFilter,
      attributes,
      req.query.page,
      req.query.limit
    )
    // Send the search results
    res.json({
      success: true,
      length: searchResults.length,
      data: searchResults,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message,
    })
  }
})

/**
 * @openapi
 * /api/v1/users/{username}:
 *   put:
 *     tags: [Users]
 *     summary: Update a user's attributes.
 *     description: Update a user's attributes by specifying the username in the URL path. You can provide the attribute name (`att`) and the new value (`value`) in the request body to perform the update.
 *     operationId: updateUserAttributes
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: The username of the user to update.
 *         example: johndoe
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               att:
 *                 type: string
 *                 description: The attribute name to update.
 *                 example: email
 *               value:
 *                 type: string
 *                 description: The new value for the attribute.
 *                 example: newemail@example.com
 *     responses:
 *       200:
 *         description: User attributes updated successfully.
 *       400:
 *         description: Bad request. The `username` parameter is missing or invalid.
 *       500:
 *         description: An error occurred while updating user attributes.
 */

router.put('/:username', async (req, res) => {
  try {
    const { att, value } = req.body
    const username = req.params.username

    const updatedUser = await service.updateUser(username, att, value)

    // Send the search results
    res.json({
      success: true,
      message: 'User updated correctly',
      data: updatedUser,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating users',
      error: error.message,
    })
  }
})

/**
 * @openapi
 * /api/v1/users/modify-ldap:
 *   post:
 *     tags: [Users]
 *     summary: Modify LDAP user attributes.
 *     description: Modify LDAP user attributes by specifying the DN (Distinguished Name) and the new attribute values. You can provide a DN in the request body and an object containing attributes to modify. The attributes are provided as key-value pairs, where the key is the attribute name and the value is the new value to set. All specified attributes will be replaced with the new values.
 *     operationId: modifyLdapUserAttributes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dn:
 *                 type: string
 *                 description: The Distinguished Name (DN) of the user whose attributes you want to modify.
 *                 example: cn=johndoe,ou=people,dc=example,dc=com
 *               attributes:
 *                 type: object
 *                 description: A key-value object containing attributes to modify.
 *                 example:
 *                   email: newemail@example.com
 *                   telephoneNumber: +1 123-456-7890
 *     responses:
 *       200:
 *         description: LDAP user attributes modified successfully.
 *       400:
 *         description: Bad request. The `dn` or `attributes` parameter is missing or invalid.
 *       500:
 *         description: An error occurred while modifying LDAP user attributes.
 */
router.post('/modify-ldap', async (req, res) => {
  const dn = req.body.dn
  const attributes = req.body.attributes

  const modifications = []

  // Loop through the updated attributes and create modification objects
  for (const attributeName in attributes) {
    if (attributes.hasOwnProperty(attributeName)) {
      const attributeValue = attributes[attributeName]

      // Create a modification object to replace the attribute value
      const modification = new ldap.Change({
        operation: 'replace', // Use 'replace' to replace the attribute value
        modification: {
          type: attributeName,
          values: [attributeValue],
        },
      })

      modifications.push(modification)
    }
  }

  let errorOccurred = false // Track if any modification failed

  // Perform the LDAP modify operation with all modifications
  for (const modification of modifications) {
    ldapClient.modify(dn, modification, (err) => {
      if (err) {
        console.error('Error modifying attributes:', err)
        errorOccurred = true
      }
    })
  }

  if (errorOccurred) {
    res.status(500).json({ error: 'Error modifying attributes' })
  } else {
    console.log('Attributes modified successfully')
    res.json({ message: 'Attributes modified successfully' })
  }
})

/**
 * @openapi
 * /api/v1/users/newUser:
 *   post:
 *     tags: [Users]
 *     summary: Add a new user to LDAP.
 *     description: Add a new user to the LDAP directory. Specify the DN (Distinguished Name) where the new user will be created and provide user attributes as a JSON object. The request body should contain the `newUser` object with user attributes and the `userDN` string that defines the DN of the new user.
 *     operationId: addNewUser
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newUser:
 *                 type: object
 *                 description: User attributes for the new LDAP user.
 *                 example:
 *                   cn: johndoe
 *                   sn: Doe
 *                   givenName: John
 *                   mail: johndoe@example.com
 *               userDN:
 *                 type: string
 *                 description: The Distinguished Name (DN) of the new user.
 *                 example: cn=johndoe,ou=people,dc=example,dc=com
 *     responses:
 *       200:
 *         description: New user added to LDAP successfully.
 *       400:
 *         description: Bad request. The `newUser` or `userDN` parameter is missing or invalid.
 *       500:
 *         description: An error occurred while adding the new user to LDAP.
 */

router.post('/newUser', async (req, res) => {
  try {
    const { newUser, userDN } = req.body
    const propertiesToDelete = ['dn', 'controls', 'objectClass', 'objectclass']

    if (!newUser || !userDN) {
      throw new Error('Missing atts')
    }

    propertiesToDelete.map((att) => {
      if (newUser && newUser.hasOwnProperty(att)) {
        delete newUser[att]
      }
    })

    // Call the service function with the required parameters
    const response = await service.addUser(userDN, newUser) // Replace 'YourDNHere' with the appropriate DN.

    if (response) {
      res.status(200).json({ message: 'New user added successfully.' })
    } else {
      res
        .status(500)
        .json({ error: 'Failed to add the new user to the LDAP directory.' })
    }
  } catch (error) {
    console.error('Error in route:', error)
    res.status(500).json({ error: error.message })
  }
})
module.exports = router
