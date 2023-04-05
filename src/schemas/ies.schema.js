const objectClasses = [
  {
    name: 'organizationalCenter',
    sup: 'organizationalUnit',
    description: 'Clase para las facultades y centros',
  },
  {
    name: 'researchGroup',
    sup: 'top',
    description: 'object class para los grupos de investigacion',
  },
  {
    name: 'organizationalMember',
    sup: 'top',
    description: 'Clase abstracta para los miembros de la organizacion',
  },
  {
    name: 'iesStudent',
    sup: 'organizationalMember',
    description: 'object class para los estudiantes',
  },
  {
    name: 'iesStaff',
    sup: 'organizationalMember',
    description: 'Clase para el personal de la universidad',
  },
  {
    name: 'iesEducationalStaff',
    sup: 'iesStaff',
    description: 'Clase para el personal docente de la universidad',
  },
  {
    name: 'iesNonEducationalStaff',
    sup: 'iesStaff',
    description: 'Clase para el personal no docente de la universidad',
  },
  {
    name: 'iesServices',
    sup: 'top',
    description:
      'Clase para mantener el estado de los servicios a los usuarios',
  },
  {
    name: 'iesTemporal',
    sup: 'organizationalMember',
    description: 'Clase para el personal de la universidad',
  },
  {
    name: 'siccServices',
    sup: 'organizationalMember',
    description: 'Clase para el SICC',
    },
    
]

module.exports = objectClasses
