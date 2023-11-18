const express = require('express')
const router = express.Router()
const { checkAuth, checkRoles } = require('@src/middlewares/auth.handler')
const config = require('@src/config/config')
const ldap = require('ldapjs')
const ldapClient = require('@src/connections/LDAP_client')
const {
  userTypeFilters,
  attributeFilters,
} = require('@src/constants/query_options')

router.use(checkAuth, checkRoles('admin'))

// Función para filtrar información sensible
const sanitizeConfig = (config) => {
  // Clona la configuración para no modificar el objeto original
  const sanitizedConfig = { ...config }

  // Elimina atributos sensibles
  delete sanitizedConfig.apiKey
  delete sanitizedConfig.sessionSecret

  // Elimina atributos sensibles dentro del objeto LDAP
  delete sanitizedConfig.ldap.password
  delete sanitizedConfig.ldap.password_bind
  delete sanitizedConfig.ldap.username_bind
  delete sanitizedConfig.ldap.admin

  return sanitizedConfig
}
/* 
openapi: 3.0.0
info:
  title: LDAP Query Information API
  version: 1.0.0
paths:
  /api/v1/ldap/query-info:
    get:
      tags:
        - LDAP
      summary: Get information about LDAP query filters.
      description: |
        Retrieve information about attribute filters and user type filters used
        in LDAP queries. This endpoint provides details about available filters
        that can be used in queries.
      operationId: getLdapQueryInfo
      responses:
        '200':
          description: Successful response with LDAP query information.
          content:
            application/json:
              example:
                attributeFilters:
                  uid: 'Identificación de Usuario'
                  cn: 'Nombre Común'
                  username: 'Nombre de Usuario'
                  CI: 'Número de Identificación'
                  email: 'Dirección de Correo Electrónico'
                  lastName: 'Apellido'
                  sex: 'Género'
                  area: 'Área'
                  userCondition: 'Condición del Usuario'
                  userStatus: 'Estado del Usuario'
                  sedeMunicipio: 'Sede/Municipio'
                  userInformation: 'Información del Usuario'
                  career: 'Carrera'
                  studentClassGroup: 'Grupo Clase Estudiantil'
                  studentYear: 'Año Estudiantil'
                  country: 'País'
                  UJC: 'UJC'
                  skinColor: 'Color de Piel'
                  sn: 'Apellido'
                  displayName: 'Nombre a Mostrar'
                  mail: 'Correo Electrónico'
                  maildrop: 'Mail Drop'
                  objectName: 'Nombre del Objeto'
                  dn: 'Nombre Distinguido'
                  workerID: 'ID del Trabajador'
                  workArea: 'Área de Trabajo'
                  nameInstitution: 'Nombre de la Institución'
                  workercontract: 'Contrato del Trabajador'
                  userYears: 'Años del Usuario'
                  schoolLevel: 'Nivel Escolar'
                  orgRole: 'Rol en la Organización'
                  educationalCategory: 'Categoría Educativa'
                  scientificCategory: 'Categoría Científica'
                  ou: 'Unidad Organizativa'
                userTypeFilters:
                  student: 'Estudiante'
                  docent_employee: 'Docente/Empleado'
                  employee: 'Empleado'

*/
router.get('/query-info', async (req, res) => {
  try {
    const queryInfo = {
      attributeFilters: attributeFilters,
      userTypeFilters: userTypeFilters,
    }
    res.json(queryInfo)
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: true,
    })
  }
})

/**
 * @openapi
 * /api/v1/config:
 *   get:
 *     tags: [LDAP]
 *     summary: Get LDAP server configuration.
 *     description: Retrieves the configuration details of the LDAP server. This endpoint is accessible only to users with the 'superadmin' role.
 *     operationId: getLdapConfig
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: LDAP server configuration retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates whether the request was successful.
 *                   example: true
 *                 config:
 *                   type: object
 *                   description: LDAP server configuration with sensitive information removed.
 *                   $ref: '#/components/schemas/LdapConfig'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */

router.get('/config', checkRoles('superadmin'), async (req, res) => {
  try {
    // Filtra la información sensible antes de enviarla al cliente
    const sanitizedConfig = sanitizeConfig(config)

    res.json({
      success: true,
      config: sanitizedConfig,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: true,
    })
  }
})

module.exports = router
