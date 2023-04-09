const axios = require('axios')

const loginUrl = 'http://127.0.0.1:4000/login'

describe('Prueba de autenticación de usuario', () => {
  test('La autenticacion debe funcionar con los usuarios que estan en el LDAP y devolver un JWT', async () => {
    //Peticion correcta
    const loginData = {
      username: 'agonzalezb',
      password: '00092068426',
    }
    const respuesta = await axios.post(loginUrl, loginData) // Realizar una petición POST al endpoint de login
    expect(respuesta.status).toBe(200) // Verificar que la respuesta tenga un estado 200 (OK)
    expect(respuesta.data.data === undefined).toBeFalse // Verificar que la respuesta tenga un cuerpo (no sea nula o vacía)

    const token = respuesta.data.data.token
    expect(token === undefined || token === null).toBeFalse
    expect(token.length).toBeGreaterThan(0)
  })
})
