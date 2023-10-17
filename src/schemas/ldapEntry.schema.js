const Joi = require('joi')
const { userTypes } = require('@src/constants/userTypes')

const userSchema = Joi.object({
  CI: Joi.string().required(),
  middleName: Joi.string().required(),
  lastName: Joi.string().required(),
  name: Joi.string().required(),
  homeAddress: Joi.string().required(),
  telephoneNumber: Joi.string().required(),
  dayRegister: Joi.date().iso().required(),
  sex: Joi.string().valid('M', 'F').required(),
  area: Joi.string().allow(null).required(),
  userCondition: Joi.string().required(),
  userStatus: Joi.string().required(),
  sedeMunicipio: Joi.string().required(),
  userType: Joi.string().required(),
  userInformation: Joi.string().required(),
  career: Joi.string().required(),
  studentClassGroup: Joi.string().required(),
  studentYear: Joi.string().required(),
  country: Joi.string().required(),
  UJC: Joi.string().required(),
  skinColor: Joi.string().required(),
  nameInstitution: Joi.string().required(),
  right: Joi.string().required(),
  hash: Joi.string().required(),
  lastTimeChange: Joi.string().required(),
  uid: Joi.string().required(),
  homeDirectory: Joi.string().required(),
  givenName: Joi.string().required(),
  cn: Joi.string().required(),
  sn: Joi.string().required(),
  displayName: Joi.string().required(),
  uidNumber: Joi.string().required(),
  userPassword: Joi.string().required(),
  mail: Joi.array().items(Joi.string()).required(),
  maildrop: Joi.array().items(Joi.string()).required(),
  gidNumber: Joi.string().required(),
  sambaSID: Joi.string().required(),
  objectClass: Joi.array().items(Joi.string()).required(),
})

const studentSchema = Joi.object({
  career: Joi.string().required(),
  studentYear: Joi.string().required(),
  studentClassGroup: Joi.string().required(),
  userInformation: Joi.string().required(),
  userCondition: Joi.string().required(),
  userStatus: Joi.string().required(),
})

const employeeSchema = Joi.object({
  dateContract: Joi.date().required(),
  dateEndContract: Joi.date().required(),
  educationalCategory: Joi.string().required(),
  orgRole: Joi.string().required(),
  schoolLevel: Joi.string().required(),
  scientificCategory: Joi.string().required(),
  userYears: Joi.string().required(),
  workerContract: Joi.string().required(),
  workArea: Joi.string().required(),
  workerID: Joi.string().required(),
})

const ldapEntrySchema = userSchema.when('userType', {
  is: userTypes[0],
  then: studentSchema,
  otherwise: employeeSchema,
})

module.exports = { ldapEntrySchema, studentSchema, employeeSchema, userSchema }
