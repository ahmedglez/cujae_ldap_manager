const express = require('express')
const router = express.Router()
const config = require('../config/config')

const TreeServices = require('../services/tree.services')
const service = TreeServices()

const PROFESSORS_CLASS = config.ldap.objectClasses[5].name
const STUDENT_CLASS = config.ldap.objectClasses[3].name

router.get('/estudiantes', (req, res) => {
  service
    .getAllStudents()
    .then((data) =>
      res.status(200).json({
        success: 'true',
        message: 'data fetched succesfully',
        data: data,
      })
    )
    .catch((err) =>
      res.status(400).send({
        success: 'false',
        message: err.message,
      })
    )
})
router.get('/profesores', (req, res) => {
  service
    .getAllProffesors()
    .then((data) =>
      res.status(200).json({
        success: 'true',
        message: 'data fetched succesfully',
        data: data,
      })
    )
    .catch((err) =>
      res.status(400).send({
        success: 'false',
        message: err.message,
      })
    )
})
router.get('/year/:year', (req, res) => {
  service
    .getUsersByYear(req.params.year)
    .then((data) =>
      res.status(200).json({
        success: 'true',
        message: 'data fetched succesfully',
        data: data,
      })
    )
    .catch((err) =>
      res.status(400).send({
        success: 'false',
        message: err.message,
      })
    )
})
router.get('/branch/:branch', (req, res) => {
  service
    .getUserByBranch(req.params.branch)
    .then((data) =>
      res.status(200).json({
        success: 'true',
        message: 'data fetched succesfully',
        data: data,
      })
    )
    .catch((err) =>
      res.status(400).send({
        success: 'false',
        message: err.message,
      })
    )
})
//get students by year and branch
router.get('/estudiantes/', (req, res) => {
  const year = req.query.year
  const branch = req.query.branch
  service
    .getUsersByYearAndBranch(year, branch, STUDENT_CLASS)
    .then((data) =>
      res.status(200).json({
        success: 'true',
        message: 'data fetched succesfully',
        data: data,
      })
    )
    .catch((err) =>
      res.status(400).send({
        success: 'false',
        message: err.message,
      })
    )
})
//get professors by year and branch
router.get('/profesores/', (req, res) => {
  const year = req.query.year
  const branch = req.query.branch
  service
    .getUsersByYearAndBranch(year, branch, PROFESSORS_CLASS)
    .then((data) =>
      res.status(200).json({
        success: 'true',
        message: 'data fetched succesfully',
        data: data,
      })
    )
    .catch((err) =>
      res.status(400).send({
        success: 'false',
        message: err.message,
      })
    )
})

module.exports = router
