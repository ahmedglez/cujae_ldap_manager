const app = require('../../server')
const supertest = require('supertest')
const config = require('../config/config')

describe('Pruebas de funcionalidad', () => {
  
  describe('Caso de uso 1: Verificar que la API pueda autenticar a los usuarios en el directorio LDAP', () => {
    it('debería autenticar a un usuario con credenciales válidas', async () => {
      const request = supertest(app)
      const response = await request.post('/login').send({
        username: config.ldap.username_bind,
        password: config.ldap.password_bind,
      })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
    })

    it('no debería autenticar a un usuario con credenciales inválidas', async () => {
      const request = supertest(app)
      const response = await request
        .post('/login')
        .send({ username: 'invalid-username', password: 'invalid-password' })

      expect(response.status).toBe(401)
      expect(response.body).toStrictEqual({
        success: false,
        message: 'username or password incorrect',
      })
    })

    it('no debería autenticar a un usuario sin credenciales', async () => {
      const request = supertest(app)
      const response = await request.post('/login').send({})

      expect(response.status).toBe(401)
      expect(response.body).toStrictEqual({
        success: false,
        message: 'username and password must be both provided',
      })
    })
  })
})


  describe('Caso de uso 2: Comprobar que la API pueda realizar búsquedas en el directorio LDAP y devolver resultados precisos', () => {
  it('debería realizar una búsqueda de todos los estudiantes del grupo 31 y de la facultad de Ing. Informatica', async () => {
    const request = supertest(app)
    const { body } = await request.post('/login').send({
      username: config.ldap.username_bind,
      password: config.ldap.password_bind,
    })
    const { data } = body
    const { token } = data
    const response = await request
      .get('/users/students')
      .set('Authorization', `Bearer ${token}`)
      .query({ group: '31', branch: 'informatica' })

    expect(response.status).toBe(200)
    expect(response.body.message).toEqual('data fetched succesfully')
  })

  it('debería realizar una búsqueda de todos los profesores que pertenezcan al PCC y su grupo de investigacion sea IA', async () => {
    const request = supertest(app)
    const { body } = await request.post('/login').send({
      username: config.ldap.username_bind,
      password: config.ldap.password_bind,
    })
    const { data } = body
    const { token } = data
    const response = await request
      .get('/users/professors')
      .set('Authorization', `Bearer ${token}`)
      .query({ PCC: 'true', researchGroup: 'IA' })
    expect(response.status).toBe(200)
    expect(response.body.message).toEqual('data fetched succesfully')
  })
  
})


  describe('Caso de uso 3: verificar que la API puede proporcionar información de perfil personal del usuario a través de su JWT', () => {
    it('debe proporcionar información de perfil personal del usuario a través de su JWT', async () => {
      const request = supertest(app)
      const { body } = await request.post('/login').send({
        username: config.ldap.username_bind,
        password: config.ldap.password_bind,
      })
      const { data } = body
      const { token } = data

      const response = await request
        .get('/profile')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.message).toEqual('data fetched succesfully')
    })
  })

