/* Swagger Imports */

const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
const config = require('@src/config/config')

// Swagger definition
const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'LDAP API',
      version: '1.0.0',
      description: 'LDAP API',
      contact: {
        name: 'LDAP API',
        email: 'ahmediglez@gmail.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:4005',
      },
    ],
  },
  apis: ['./routes/*.js', '../connections/LDAP_client.js'],
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
  console.log(
    `Swagger docs available at http://localhost:${port}/api/v1/docs`
  )
}

module.exports = { swaggerDocs }
