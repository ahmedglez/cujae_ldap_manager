const express = require('express')
const passport = require('passport')
const CustomStrategy = require('passport-custom').Strategy
const { authenticate } = require('ldap-authentication')
const AuthServices = require('../services/auth.services')
const service = AuthServices()

const router = express.Router()

module.exports = router
