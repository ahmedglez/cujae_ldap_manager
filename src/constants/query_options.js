const attributeFilters = {
  uid: 'ID de Usuario',
  cn: 'Nombre Común',
  username: 'Nombre de Usuario',
  CI: 'Carnet de Identidad',
  email: 'Dirección de Correo Electrónico',
  lastName: 'Primer Apellido',
  sex: 'Género',
  area: 'Área',
  userCondition: 'Condición del Usuario: (Interno - Semi-Interno)',
  userStatus: 'Estado del Usuario (Activo - Inactivo)',
  sedeMunicipio: 'Municipio',
  userInformation: 'Información del Usuario',
  career: 'Carrera',
  studentClassGroup: 'Grupo al que Pertenece el Estudiante',
  studentYear: 'Año Estudiantil',
  country: 'País',
  UJC: 'UJC (si, no, true, false)',
  skinColor: 'Color de Piel',
  sn: 'Apellidos',
  displayName: 'Nombre a Mostrar',
  mail: 'Correo Electrónico',
  maildrop: 'Buzón de Correo',
  objectName: 'Nombre del Objeto',
  dn: 'LDAP DN',
  workerID: 'Identificación del Trabajador',
  workArea: 'Área de Trabajo',
  nameInstitution: 'Nombre de la Institución',
  workercontract: 'Contrato de Trabajo',
  userYears: 'Años del Usuario',
  schoolLevel: 'Nivel Escolar',
  orgRole: 'Rol en la Organización',
  educationalCategory: 'Categoría Educativa',
  scientificCategory: 'Categoría Científica',
  ou: 'Unidad Organizativa',
}

const userTypeFilters = {
  student: 'Estudiante',
  docent_employee: 'Trabajador',
  employee: 'Trabajador Docente',
}

module.exports = { userTypeFilters, attributeFilters }