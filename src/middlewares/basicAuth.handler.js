const { getByUsername } = require('@src/services/user.services')()
const { authenticate } = require('ldap-authentication')
const config = require('@src/config/config')
const { isSuperAdmin, isAdmin } = require('@src/services/auth.services')
const profileService = require('@src/services/profile.services')()

/* helpers */
const {
  extractBaseFromDn,
  extractGroupsFromDn,
} = require('@src/helpers/dnHelper')

const {
  addUserRegistry,
} = require('@src/modules/authentication/services/auth.services')

const LDAP_URL = config.ldap.url || 'ldap://10.8.1.104'

const generatePayloadAuth = async (user) => {
  await addUserRegistry(user)

  const last_time_logged = await profileService.getLastLoginByUsername(user.uid)
  const loginInfo = await profileService.updateLastTimeLogged(user.uid)
  // Example usage
  const ldapDn = user.dn
  const groups = extractGroupsFromDn(ldapDn)
  const rootBaseDN = extractBaseFromDn(ldapDn)
  const localBaseDN = user.dn.replace(`uid=${user.uid},`, '')

  let roles = ['user']
  const isSpAdmin = await isSuperAdmin(user.uid)
  if (isSpAdmin) {
    roles = [...roles, 'admin', 'superadmin']
  } else {
    const isAdm = await isAdmin(user.uid, localBaseDN)
    isAdm ? (roles = [...roles, 'admin']) : [...roles]
  }

  const payload = {
    dn: user.dn,
    uid: user.uid,
    groups: groups,
    base: rootBaseDN,
    localBase: localBaseDN,
    firstname: user.givenName,
    lastname: user.sn,
    fullname: user.cn,
    email: user.mail,
    ci: user.CI,
    roles,
    last_time_logged,
    loginInfo,
  }

  return payload
}

// Middleware for basic authentication
const basicAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      res.status(401).send('Unauthorized')
      return
    }

    const base64Credentials = authHeader.split(' ')[1]
    const credentials = Buffer.from(base64Credentials, 'base64').toString(
      'ascii'
    )
    const [username, password] = credentials.split(':')

    if (!username || !password) throw new Error('Invalid username or password')

    const user = await getByUsername(username)

    if (!user) {
      res.status(401).send('No user found')
      return
    }

    const authenticated = await authenticate({
      ldapOpts: { url: LDAP_URL },
      userDn: user.dn,
      userPassword: password,
    })

    if (authenticated) {
      const payload = await generatePayloadAuth(user)
      req.user = payload
      next() // Authentication successful, proceed to the next middleware or route handler
    } else {
      res.status(401).send('Unauthorized')
    }
  } catch (error) {
    console.error('Error in basicAuth middleware:', error)
    res.status(500).send(error.message)
  }
}

module.exports = { basicAuth }
