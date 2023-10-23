/* Swagger Imports */

const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
const { allowAllMiddleware } = require('@src/middlewares/auth.handler')
const config = require('@src/config/config')

// Swagger definition
const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'CUJAE LDAP API',
      version: '1.0.0',
      description: 'API para la administración de usuarios LDAP de la CUJAE',
      contact: {
        name: 'Ahmed González',
        email: 'ahmediglez@gmail.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.server.port}/api/v1`,
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'API para la autenticación de usuarios',
      },

      {
        name: 'Users',
        description: 'API para la administración de usuarios LDAP',
      },
      {
        name: 'Groups',
        description: 'API para la administración de grupos LDAP',
      },
      {
        name: 'Profile',
        description: 'API para la administración del perfil de usuario',
      },
      {
        name: 'Recovery Password',
        description: 'API para la recuperación de contraseña',
      },
      {
        name: 'Update Password',
        description: 'API para la actualización de contraseña',
      },
      {
        name: 'Reset Password',
        description: 'API para el reseteo de contraseña',
      },
      {
        name: 'Logs',
        description: 'API para la administración de logs',
      },
      {
        name: 'DN',
        description: 'API para la administración de DNs',
      },
    ],

    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            CI: {
              type: 'string',
              description: 'Carnet de identidad del usuario',
            },
            middleName: {
              type: 'string',
              description: 'Segundo nombre del usuario',
            },
            lastName: {
              type: 'string',
              description: 'Apellido del usuario',
            },
            name: {
              type: 'string',
              description: 'Nombre del usuario',
            },
            homeAddress: {
              type: 'string',
              description: 'Dirección del usuario',
            },
            telephoneNumber: {
              type: 'string',
              description: 'Número de teléfono del usuario',
            },
            dayRegister: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de registro del usuario',
            },
            sex: {
              type: 'string',
              enum: ['M', 'F'],
              description: 'Sexo del usuario',
            },
            area: {
              type: 'string',
              nullable: true,
              description: 'Área del usuario',
            },
            userCondition: {
              type: 'string',
              description: 'Condición del usuario',
            },
            userStatus: {
              type: 'string',
              description: 'Estado del usuario',
              enum: ['Activo', 'Inactivo'],
            },
            sedeMunicipio: {
              type: 'string',
              description: 'Municipio de la sede del usuario',
            },
            userType: {
              type: 'string',
              description: 'Tipo de usuario',
              enum: ['Estudiante', 'Trabajador', 'Trabajador Docente'],
            },
            userInformation: {
              type: 'string',
              description: 'Información del usuario acerca del curso',
            },
            career: {
              type: 'string',
              description: 'Carrera del usuario',
            },
            studentClassGroup: {
              type: 'string',
              description: 'Grupo del usuario',
            },
            studentYear: {
              type: 'string',
              description: 'Año del usuario',
            },
            country: {
              type: 'string',
              description: 'País del usuario',
              default: 'Cuba',
            },
            UJC: {
              type: 'string',
              description: 'Pertenece a la UJC',
            },
            skinColor: {
              type: 'string',
              description: 'Color de piel del usuario',
            },
            nameInstitution: {
              type: 'string',
              description: 'Nombre de la institución del usuario',
              default: 'CUJAE',
            },
            right: {
              type: 'string',
              description: 'Derecho del usuario',
              default: 'Todos',
            },
            hash: {
              type: 'string',
              description: 'Hash de la contraseña del usuario',
            },
            lastTimeChange: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de la última actualización de la contraseña',
            },
            uid: {
              type: 'string',
              description: 'UID del usuario. Formato: nombre.apellido',
              required: true,
            },
            homeDirectory: {
              type: 'string',
              description: 'Directorio del usuario. Formato: /home/uid',
            },
            givenName: {
              type: 'string',
              description: 'Nombre del usuario',
            },
            cn: {
              type: 'string',
              description: 'Nombre completo del usuario',
            },
            sn: {
              type: 'string',
              description: 'Apellido del usuario',
            },
            displayName: {
              type: 'string',
              description: 'Nombre de visualización del usuario',
            },
            uidNumber: {
              type: 'string',
              description: 'Número de UID del usuario. Formato: 1000',
            },
            userPassword: {
              type: 'string',
              description: 'Contraseña del usuario. Formato: {SSHA}hash',
            },
            mail: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Correo electrónico del usuario',
            },
            maildrop: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Correo electrónico del usuario',
            },
            gidNumber: {
              type: 'string',
              description: 'Número de GID del usuario. Formato: 1000',
            },
            sambaSID: {
              type: 'string',
              description:
                'SID del usuario. Formato: S-1-5-21-1004336348-1177238915-682003330-1000',
            },
            objectClass: {
              type: 'array',
              items: {
                type: 'string',
              },
              description:
                'Clases del usuario. Formato: top, person, organizationalPerson, inetOrgPerson, posixAccount, shadowAccount, sambaSamAccount',
            },
          },
        },

        Student: {
          type: 'object',
          properties: {
            career: {
              type: 'string',
            },
            studentYear: {
              type: 'string',
            },
            studentClassGroup: {
              type: 'string',
            },
            userInformation: {
              type: 'string',
            },
            userCondition: {
              type: 'string',
            },
            userStatus: {
              type: 'string',
            },
          },
        },

        Employee: {
          type: 'object',
          properties: {
            dateContract: {
              type: 'string',
              format: 'date-time',
            },
            dateEndContract: {
              type: 'string',
              format: 'date-time',
            },
            educationalCategory: {
              type: 'string',
            },
            orgRole: {
              type: 'string',
            },
            schoolLevel: {
              type: 'string',
            },
            scientificCategory: {
              type: 'string',
            },
            userYears: {
              type: 'string',
            },
            workerContract: {
              type: 'string',
            },
            workArea: {
              type: 'string',
            },
            workerID: {
              type: 'string',
            },
          },
        },

        LdapEntry: {
          oneOf: [
            {
              $ref: '#/components/schemas/Student',
            },
            {
              $ref: '#/components/schemas/Employee',
            },
          ],
        },

        JWTPayload: {
          type: 'object',
          properties: {
            sub: {
              type: 'string',
              description: 'Subject (sub) del usuario.',
            },
            dn: {
              type: 'string',
              description: 'Distinguished Name (DN) del usuario.',
            },
            uid: {
              type: 'string',
              description: 'Identificador único del usuario.',
            },
            groups: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Grupos a los que pertenece el usuario.',
            },
            base: {
              type: 'string',
              description: 'Base DN principal.',
            },
            localBase: {
              type: 'string',
              description: 'Base DN local.',
            },
            firstname: {
              type: 'string',
              description: 'Nombre del usuario.',
            },
            lastname: {
              type: 'string',
              description: 'Apellido del usuario.',
            },
            fullname: {
              type: 'string',
              description: 'Nombre completo del usuario.',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Dirección de correo electrónico del usuario.',
            },
            ci: {
              type: 'string',
              description: 'Número de identidad del usuario.',
            },
            roles: {
              type: 'array',
              items: {
                type: 'string',
              },
              enum: ['user', 'admin', 'superadmin'],
              description: 'Roles del usuario.',
            },
            last_time_logged: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha y hora de la última sesión iniciada.',
            },
            loginInfo: {
              type: 'string',
              description: 'Información de inicio de sesión.',
            },
            iat: {
              type: 'integer',
              format: 'int64',
              description: 'Tiempo de emisión del token JWT.',
            },
            exp: {
              type: 'integer',
              format: 'int64',
              description: 'Tiempo de expiración del token JWT.',
            },
          },
        },

        UserResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              description: 'El estado de la respuesta',
              example: 'OK',
            },
            data: {
              type: 'object',
              description: 'El usuario',
              $ref: '#/components/schemas/User',
            },
          },
        },
      },
    },
  },
  apis: [
    './src/api/v1/routes/*.js',
    './src/controllers/*.js',
    './src/modules/logsManagement/controllers/*.js',
    './src/modules/passwordManagement/controllers/*.js',
    './src/modules/authentication/LdapAuth.js',
    './src/api/v1/swagger.js',
  ],
}

// Initialize swagger-jsdoc -> returns validated swagger spec in json format
const specs = swaggerJsdoc(options)

//Function to setup swagger
const swaggerDocs = (app, port) => {
  app.use(
    '/api/v1/docs',
    swaggerUi.serve,
    swaggerUi.setup(specs, { explorer: true })
  )

  app.get('/api/v1/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(specs)
  })

  console.log('Swagger initialized')
  console.log(`Swagger docs available at http://localhost:${port}/api/v1/docs`)
}

module.exports = { swaggerDocs }
