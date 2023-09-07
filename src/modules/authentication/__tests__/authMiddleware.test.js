const request = require('supertest')
const express = require('express')

// Importa tu aplicación Express con la ruta protegida
const app = express()

// Configura tu aplicación Express con el middleware de sesión
const authMiddleware = (req, res, next) => {
  if (req.headers.cookie && req.headers.cookie !== undefined) {
    // El usuario está autenticado
    next()
  } else {
    // El usuario no está autenticado
    res.status(401).json({ message: 'No autorizado' })
  }
}

app.use(authMiddleware)

// Define una ruta de prueba protegida con el middleware de autenticación
app.get('/ruta-protegida', (req, res) => {
  res.json({ message: 'Ruta protegida' })
})

describe('Pruebas de autenticación', () => {
  it('Debería permitir el acceso a la ruta protegida si el usuario está autenticado', async () => {
    // Simula una sesión autenticada
    const authenticatedSession = {
      passport: { user: 'usuario-autenticado' },
    }

    // Crea una sesión de prueba con el usuario autenticado
    const sessionCookie = Buffer.from(
      JSON.stringify(authenticatedSession)
    ).toString('base64')

    const response = await request(app)
      .get('/ruta-protegida')
      .set('Cookie', [`session=${sessionCookie}`])

    // Debería responder con un código 200 si el usuario está autenticado
    expect(response.status).toBe(200)
    expect(response.body.message).toBe('Ruta protegida')
  })

  it('Debería denegar el acceso a la ruta protegida si el usuario no está autenticado', async () => {
    const response = await request(app).get('/ruta-protegida')

    // Debería responder con un código 401 si el usuario no está autenticado
    expect(response.status).toBe(401)
    expect(response.body.message).toBe('No autorizado')
  })
})
