const express = require('express')
const passport = require('passport')
const CustomStrategy = require('passport-custom').Strategy
const { authenticate } = require('ldap-authentication')
const AuthServices = require('../services/auth.services')
const service = AuthServices()

const router = express.Router()

router.post('/test', (req, res, next) => {
  console.log('test')
  res.send('test')
})

router.get('/login', (req, res, next) => {
  console.log('login')
  res.send('login')
})

module.exports = router
