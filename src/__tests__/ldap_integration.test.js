const axios = require('axios')

const loginUrl = 'http://127.0.0.1:4000/login'
const usersUrl = 'http://127.0.0.1:4000/users/'



describe('Prueba de integracion con el LDAP', () => {
  test('La integracion con el LDAP debe funcionar y devolver usuarios dentro del servidor', async () => {
    const loginData = {
      username: 'agonzalezb',
      password: '00092068426',
    }
    const respuesta = await axios.post(loginUrl, loginData)
    const token = respuesta.data.data.token
    // Realizar una petición GET al endpoint de "Get User By Username"
    const response = await axios.get(usersUrl + 'agonzalezb', {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    })
    //verificar que el estado de la peticion no sea 401
    expect(response.status).toEqual(200)
    //verificar que la propiedad success sea true
    expect(response.data.success).toEqual(true)
    //verificar que el mensaje de la peticion sea "data fetched succesfully"
    expect(response.data.message).toEqual('data fetched succesfully')
    //verificar que el usuario solicitado sea el correcto
    expect(response.data.data.objectName).toEqual(
      'uid=agonzalezb,ou=usuarios,ou=informatica,dc=cujae,dc=edu,dc=cu'
    )
  })
})

