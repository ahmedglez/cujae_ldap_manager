const fs = require('fs')
const express = require('express')
const router = express.Router()
const { checkAuth, checkRoles } = require('@src/middlewares/auth.handler')
const { decodeJWT } = require('@src/utils/authentication/tokens/jwtUtils')
const { WebSocketServer, OPEN } = require('ws')
const Tail = require('tail').Tail
const path = require('path')

// Initialize the tail instance to monitor the log file
const tail = new Tail('logs/all.log', {
  fromBeginning: true, // Start reading from the beginning of the file
  follow: true, // Continue monitoring the file for new lines
})

// Create a set to store connected WebSocket clients
const clients = new Set()

// Function to send logs to connected WebSocket clients
const sendLogsToClients = (logs) => {
  const logEntries = logs.split('\n').filter(Boolean)
  clients.forEach((client) => {
    if (client.readyState === OPEN) {
      logEntries.forEach((log) => {
        client.send(log)
      })
    }
  })
}

// Read and parse the log file
const parseLogFile = () => {
  const logData = fs.readFileSync('logs/all.log', 'utf-8')
  return logData
}

const wss = new WebSocketServer({
  port: 5006,
  perMessageDeflate: {
    zlibDeflateOptions: {
      // See zlib defaults.
      chunkSize: 1024,
      memLevel: 7,
      level: 3,
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024,
    },
    // Other options settable:
    clientNoContextTakeover: true, // Defaults to negotiated value.
    serverNoContextTakeover: true, // Defaults to negotiated value.
    serverMaxWindowBits: 10, // Defaults to negotiated value.
    // Below options specified as default values.
    concurrencyLimit: 10, // Limits zlib concurrency for perf.
    threshold: 1024, // Size (in bytes) below which messages
    // should not be compressed if context takeover is disabled.
  },
})

const parseLogFileToJson = () => {
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

tail.on('line', (data) => {
  sendLogsToClients(data)
})

wss.on('error', console.error)

wss.on('open', function open() {
  wss.send('something')
})

wss.on('message', function message(client, data) {
  console.log('received: %s', data)
})

// Serve the last log entry to new WebSocket clients
wss.on('connection', (client) => {
  clients.add(client) // Add the client to the set
  client.send(parseLogFile()) // Send the current log content to the new client
})

// Remove clients from the set when they close the connection
wss.on('close', (client) => {
  clients.delete(client)
})

// WebSocket upgrade handler
router.server = (server) => {
  // Upgrade HTTP request to WebSocket
  server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (client) => {
      wss.emit('connection', client, request)
    })
  })
}

router.get('/logs', checkAuth, checkRoles('admin'), (req, res) => {
  const payload = decodeJWT(req.headers.authorization.split(' ')[1])
  const isSuperAdmin = payload.roles.includes('superadmin')
  const queryParams = req.query
  const logs = parseLogFileToJson()

  const filteredLogs = logs.filter((log) => {
    return Object.entries(queryParams).every(([key, value]) => {
      if (key === 'level' && !log.level.startsWith(value)) {
        return false
      }

      if (!isSuperAdmin) {
        return log.message.branch === payload.localBase
      }

      if (key in log.message && log.message[key] !== value) {
        return false
      }

      return true
    })
  })

  // Function to filter logs by date range
  const filterLogsByDateRange = (logs, startDate, endDate) => {
    return logs.filter((log) => {
      const logDate = new Date(log.date)
      return logDate >= startDate && logDate <= endDate
    })
  }

  const period = req.query.period
  if (period === 'daily') {
    const currentDate = new Date()
    const startDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    )
    const endDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate() + 1
    )
    const dailyLogs = filterLogsByDateRange(filteredLogs, startDate, endDate)
    res.json(dailyLogs)
  } else if (period === 'weekly') {
    const currentDate = new Date()
    const startDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() - 7
    )
    const weeklyLogs = filterLogsByDateRange(
      filteredLogs,
      startDate,
      currentDate
    )
    res.json(weeklyLogs)
  } else if (period === 'monthly') {
    const currentDate = new Date()
    const startDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() - 30
    )
    const monthlyLogs = filterLogsByDateRange(
      filteredLogs,
      startDate,
      currentDate
    )
    res.json(monthlyLogs)
  } else {
    res.json(filteredLogs) // Return filtered logs without date filtering if no period is specified
  }
})

// Define a route to retrieve the log file
router.get('/log-file', checkAuth, checkRoles('superadmin'), (req, res) => {
  const logFilePath = path.join(__dirname, '../../../../logs/all.log') // Adjust the path as needed
  const fileStream = fs.createReadStream(logFilePath)

  // Set response headers for downloading the log file
  res.setHeader('Content-Disposition', 'attachment; filename="all.log"')
  res.setHeader('Content-Type', 'text/plain')

  fileStream.pipe(res)
})

module.exports = router