const User = require('@src/schemas/user.schema').User

const addUserRegistry = async (user) => {
  const { uid, cn, sn, dn, mail } = user

  try {
    // Busca al usuario por su nombre de usuario
    let existingUser = await User.findOne({ username: uid })

    if (existingUser) {
      // El usuario ya existe, agrega un nuevo registro a su matriz "registry"
      existingUser.registry.push({ timestamp: new Date() })
      await existingUser.save()
    } else {
      // El usuario no existe, crea un nuevo usuario con el registro inicial
      const newUser = new User({
        username: uid,
        cn,
        sn,
        dn,
        mail,
        registry: [{ timestamp: new Date() }],
      })
      await newUser.save()
    }

    console.log('Registro de usuario exitoso')
  } catch (error) {
    console.error('Error al agregar registro de usuario:', error)
    throw error // Puedes manejar el error según tus necesidades
  }
}

module.exports = { addUserRegistry }
