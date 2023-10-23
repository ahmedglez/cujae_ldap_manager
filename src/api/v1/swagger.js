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
        name: 'Users',
        description: 'API para la administración de usuarios LDAP',
      },
    ],

    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            uid: {
              type: 'string',
              description: 'El uid del usuario',
              example: 'ahmediglez',
            },
            cn: {
              type: 'string',
              description: 'El nombre del usuario',
              example: 'Ahmed González',
            },
            sn: {
              type: 'string',
              description: 'El apellido del usuario',
              example: 'González',
            },
            mail: {
              type: 'string',
              description: 'El correo electrónico del usuario',
              example: 'ahmediglez@gmaul.com',
            },
            password: {
              type: 'string',
              description: 'La contraseña del usuario',
              example: '123456',
            },
            roles: {
              type: 'array',
              description: 'Los roles del usuario',
              items: {
                type: 'string',
                example: 'admin',
              },
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
