const express = require('express')
const router = express.Router()
const UserServices = require('@src/services/user.services.js')
const validateResponse = require('@src/middlewares/validateResponse')
const {
  checkAuth,
  checkRoles,
  checkBlacklist,
} = require('@src/middlewares/auth.handler')
const service = UserServices()
const config = require('@src/config/config')
const {
  createLdapFilterFromQuery,
} = require('@src/helpers/convertQueryToFilter')
const validateQuery = require('@src/middlewares/queryValidator')
const ldap = require('ldapjs')
const ldapClient = require('@src/connections/LDAP_client')

// Middleware for routes requiring checkAuth and checkRoles('admin')
router.use(checkAuth, checkRoles('admin'))

// Middleware to handle common success and error responses

// Route handler for getting all users
router.get('/', async (req, res) => {
  try {
    const { localBase, roles } = req.user
    const isValid = validateQuery(req.query)
    const queryFilter = createLdapFilterFromQuery(req.query)
    const ldapFilter = `(&(objectClass=person)${queryFilter})`

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

// Get users by groups
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

module.exports = router
