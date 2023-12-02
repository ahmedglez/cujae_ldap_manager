const { config } = require('@src/config/config')
const nodemailer = require('nodemailer')
const smtpTransport = require('nodemailer-smtp-transport')
const handlebars = require('handlebars')
const fs = require('fs')
const userServices = require('@src/services/user.services')()
const path = require('path')
const UserAndRecoveryCode = require('../schemas/user&recoveryCode.schema')
const {
  generateRandomSixDigitNumber,
  readHTMLFile,
} = require('../utils/emailUtils')

const generateRecoveryCode = async (user, expiration) => {
  try {
    let userInDB = await UserAndRecoveryCode.findOne({
      username: user.uid,
    })

    const code = generateRandomSixDigitNumber()

    if (!userInDB) {
      // If the user doesn't exist, create a new user
      const newUserInDB = new UserAndRecoveryCode({
        username: user.uid, // Adjust the field name as needed
        // Set other user fields as needed (e.g., name, email, password)
        // ...
        email: user.maildrop,
        recoveryCode: {
          code: code,
          expiresAt: expiration,
        },
      })
      newUserInDB.save()
    } else {
      // If the user exists, update the recovery code
      userInDB.recoveryCode.code = code
      userInDB.recoveryCode.expiresAt = expiration
      await userInDB.save()
    }
    return code
  } catch (error) {
    throw error
  }
}

const sendRecoveryPasswordEmailTo = async (user, code) => {
  try {
    const name = user.name
    const email = user.maildrop

    const transporter = nodemailer.createTransport(
      smtpTransport({
        service: process.env.EMAIL_SERVICE,
        host: process.env.EMAIL_HOST,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      })
    )

    readHTMLFile(
      path.join(__dirname, '../templates/reset-password-email.html'),
      function (err, html) {
        if (err) {
          console.log('error reading file', err)
          return
        }

        const template = handlebars.compile(html)
        const replacements = {
          name,
          code,
        }
        const htmlToSend = template(replacements)

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Reestablecimiento de Contraseña',
          html: htmlToSend,
        }

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error)
          } else {
            console.log('Email sent: ' + info.response)
          }
        })
      }
    )
  } catch (error) {
    console.error(error)
    throw new Error('Error on sending email')
  }
}

async function checkRecoveryCode(username, recoveryCode) {
  try {
    // Find a user by username
    const user = await UserAndRecoveryCode.findOne({ username })

    // Check if the user exists and has a recovery code set
    if (!user || !user.recoveryCode || !user.recoveryCode.code) {
      return {
        isValid: false,
        message: 'User not found or no recovery code set.',
      }
    }

    // Check if the recovery code matches
    if (user.recoveryCode.code !== recoveryCode) {
      return { isValid: false, message: 'Invalid recovery code.' }
    }

    // Check if the recovery code has expired
    const currentTime = new Date()
    if (
      user.recoveryCode.expiresAt &&
      currentTime > user.recoveryCode.expiresAt
    ) {
      return { isValid: false, message: 'Recovery code has expired.' }
    }

    // Recovery code is valid
    return { isValid: true, message: 'Recovery code is valid.' }
  } catch (error) {
    console.error('Error checking recovery code:', error)
    throw error
  }
}

const sendSuccessPasswordEmailTo = async (username, email) => {
  try {
    const transporter = nodemailer.createTransport(
      smtpTransport({
        service: process.env.EMAIL_SERVICE,
        host: process.env.EMAIL_HOST,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      })
    )

    readHTMLFile(
      path.join(__dirname, '../templates/successful-password-change.html'),
      function (err, html) {
        if (err) {
          console.log('error reading file', err)
          return
        }

        const template = handlebars.compile(html)
        const replacements = {
          username,
        }
        const htmlToSend = template(replacements)

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Reestablecimiento de Contrasena',
          html: htmlToSend,
        }

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error)
          } else {
            console.log('Email sent: ' + info.response)
          }
        })
      }
    )
  } catch (error) {
    console.error(error)
    throw new Error('Error on sending email')
  }
}

module.exports = {
  generateRecoveryCode,
  sendRecoveryPasswordEmailTo,
  checkRecoveryCode,
  sendSuccessPasswordEmailTo,
}
