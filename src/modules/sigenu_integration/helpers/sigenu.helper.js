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

module.exports = { parseLoginPayload }
