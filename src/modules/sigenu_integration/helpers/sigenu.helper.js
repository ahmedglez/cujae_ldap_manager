/* {
    "email": "MiCorreo",
    "facultyId": "Id de facultad en SIGENU |null",
    "townUniversityId": "Id de la filial o sede universitaria en SIGENU |null",  
    "identification": "MiCI",
    "lastname": "SegundoApellido",
    "name": "Nombre",
    "role": "PROFESSOR|STUDENT",
    "status": "ACTIVE|BLOCKED",
    "surname": "PrimerApellido",
    "username": "MiUsuario"
}
 */

/*   {
        "address": "Dirección Particular",
        "email": "Correo del profesor",
        "identification": "CI del profesor",
        "lastname": "Segundo apellido",
        "name": "Nombre",
        "phone": "Teléfono",
        "scientificCategory": "Categoría Científica|null",
        "surname": "Segundo apellido",
        "teachingCategory": "Categoría Docente|null ",
        "area": "Nombre del area a la que pertece|null",
        "user": "Nombre de usuario"
    }
 */

const parseLoginPayload = (ldapUser) => {
  const payload = {
    email: ldapUser?.mail || ldapUser?.maildrop,
    facultyId: ldapUser?.area || ldapUser?.workArea || null,
    townUniversityId: ldapUser?.nameInstitution || null,
    identification: ldapUser?.CI,
    lastname: ldapUser?.lastName,
    name: ldapUser?.cn || ldapUser?.name,
    role: ldapUser?.userType === 'Estudiante' ? 'STUDENT' : 'PROFESSOR',
    status:
      ldapUser?.userStatus === 'Activo' || ldapUser?.userStatus === true
        ? 'ACTIVE'
        : 'BLOCKED',
    surname: ldapUser?.middleName,
    username: ldapUser?.uid,
  }

  return payload
}

const createProfessorsFilter = (queryJson) => {
  const { identification, name, lastname, surname, email } = queryJson
  const filters = []

  if (!!identification && identification !== '')
    filters.push(`(CI=${identification})`)
  if (!!name && name !== '') filters.push(`(name=${name})`)
  if (!!lastname && lastname !== '') filters.push(`(lastName=${lastname})`)
  if (!!surname && surname !== '') filters.push(`(middleName=${surname})`)
  if (!!email && email !== '') filters.push(`(mail=${email})`)

  if (filters.length === 0) {
    return ''
  }

  const ldapFilter = filters.join('')

  return ldapFilter
}

// Parsea un array de entradas del LDAP a un array de Json customizados
const parseLdapEntryToProfessorDto = (entries) => {
  const parsedEntries = entries.map((entry) => {
    return {
      address: entry.homeAddress,
      email: entry.mail,
      identification: entry.CI,
      lastname: entry.lastName,
      name: entry.name,
      phone: entry.telephoneNumber,
      scientificCategory: entry.scientificCategory || null,
      surname: entry.middleName,
      teachingCategory: entry.schoolLevel || null,
      area: entry.area || null,
      user: entry.user,
    }
  })

  return parsedEntries
}

module.exports = {
  parseLoginPayload,
  createProfessorsFilter,
  parseLdapEntryToProfessorDto,
}
