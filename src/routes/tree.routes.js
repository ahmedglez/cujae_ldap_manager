const express = require('express')
const router = express.Router()

const TreeServices = require('../services/tree.services')
const service = TreeServices()

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
    .getUserByYear(req.params.year)
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
router.get('/years', (req, res) => {
  service
    .getUsersByYears()
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

module.exports = router
