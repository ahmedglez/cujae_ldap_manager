const fs = require('fs')

function generateRandomSixDigitNumber() {
  const min = 100000 // Minimum six-digit number (100000)
  const max = 999999 // Maximum six-digit number (999999)

  // Generate a random number within the specified range
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min

  return randomNumber
}

function readHTMLFile(path, callback) {
  fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
    if (err) {
      callback(err)
    } else {
      callback(null, html)
    }
  })
}




module.exports = { generateRandomSixDigitNumber, readHTMLFile }
