const express = require('express')
const router = express.Router()
const UserServices = require('../services/user.services')
const service = UserServices()
const Joi = require('joi')

router.get('/', (req, res) => {
  service
    .getAll()
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
router.get('/:username', (req, res) => {
  service
    .getByUsername(req.params.username)
    .then((data) =>
      res.status(200).json({
        success: 'true',
        message: 'data fetched succesfully',
        data: data,
      })
    )
    .catch((err) => {
      console.log('error: ', err)
      res.status(400).send({
        success: 'false',
        message: err.message,
      })
    })
})
router.get('/ci/:ci', (req, res) => {
  service
    .getByCI(req.params.ci)
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
router.get('/email/:email', (req, res) => {
  service
    .getByEmail(req.params.email)
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
