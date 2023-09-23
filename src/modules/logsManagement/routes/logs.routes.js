const fs = require('fs')
const express = require('express')
const router = express.Router()

// Read and parse the log file
const parseLogFile = () => {
  const logData = fs.readFileSync('logs/all.log', 'utf-8')
  const logs = logData
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const splittedLine = line.split(' ')
      const message = splittedLine[3].replace(/^"(.*)"$/, '$1')
      const parsedMessage = JSON.parse(message)

      const log = {
        date: splittedLine[0],
        time: splittedLine[1],
        level: splittedLine[2],
        message: parsedMessage,
      }
      return log
    })

  return logs
}
router.get('/logs', (req, res) => {
  const queryParams = req.query
  const logs = parseLogFile()

  const filteredLogs = logs.filter((log) => {
    return Object.entries(queryParams).every(([key, value]) => {
      if (key === 'level' && !log.level.startsWith(value)) {
        return false
      }
      if (key in log.message && log.message[key] !== value) {
        return false
      }
      return true
    })
  })

  res.json(filteredLogs)
})

module.exports = router
