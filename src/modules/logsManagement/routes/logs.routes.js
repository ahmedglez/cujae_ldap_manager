const fs = require('fs')
const express = require('express')
const router = express.Router()
const { checkAuth, checkRoles } = require('@src/middlewares/auth.handler')
const { decodeJWT } = require('@src/utils/authentication/tokens/jwtUtils')
const { WebSocketServer, OPEN } = require('ws')

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

const wss = new WebSocketServer({
  port: 5005,
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

// WebSocket connection handler
wss.on('error', console.error)

wss.on('open', function open() {
  wss.send('something')
})

wss.on('message', function message(data) {
  console.log('received: %s', data)
})

// Function to send logs to connected WebSocket clients
const sendLogsToClients = (clients, logs) => {
  clients.forEach((client) => {
    if (client.readyState === OPEN) {
      client.send(JSON.stringify(logs))
    }
  })
}

// Watch for changes in the log file and notify connected clients
fs.watch('logs/all.log', (eventType, filename) => {
  if (eventType === 'change') {
    const logs = parseLogFile()
    sendLogsToClients([...wss.clients], logs)
  }
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
  const logs = parseLogFile()

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

  res.json(filteredLogs)
})

module.exports = router
