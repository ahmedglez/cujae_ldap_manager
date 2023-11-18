const fs = require('fs')
const express = require('express')
const router = express.Router()
const { checkAuth, checkRoles } = require('@src/middlewares/auth.handler')
const { WebSocketServer, OPEN } = require('ws')
const Tail = require('tail').Tail
const path = require('path')
const Log = require('@src/schemas/logs.schema')
const {
  filterLogsByTimeframe,
} = require('@src/modules/logsManagement/utils/datesFilters')

router.use(checkAuth, checkRoles('superadmin'))

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

/**
 * @openapi
 * /api/v1/logs:
 *   get:
 *     tags: [Logs]
 *     summary: Get log entries.
 *     description: Retrieve log entries based on query parameters.
 *     operationId: getLogEntries
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *         description: Filter log entries by level.
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *         description: Filter log entries by period (daily, weekly, monthly).
 *     responses:
 *       200:
 *         description: A list of log entries.
 *       401:
 *         description: Unauthorized or insufficient permissions.
 */

router.get('/', async (req, res) => {
  try {
    const {
      method,
      url,
      user,
      status,
      page = 1,
      limit = 10,
      order = 'desc',
      timeframe = 'all',
    } = req.query

    const conditions = []

    if (method) conditions.push({ message: { $regex: `method: '${method}'` } })
    if (url) conditions.push({ message: { $regex: `url: '${url}'` } })
    if (user) conditions.push({ message: { $regex: `user: '${user}'` } })
    if (status) conditions.push({ message: { $regex: `status: ${status}` } })

    const query = conditions.length > 0 ? { $and: conditions } : {}

    const sortOrder = order === 'asc' ? 1 : -1

    const logs = await Log.find(query)
      .sort({ timestamp: sortOrder }) // Always sort by timestamp
      .skip((page - 1) * limit)
      .limit(parseInt(limit))

    let filteredLogs = logs

    if (timeframe) {
      filteredLogs = filterLogsByTimeframe(filteredLogs, timeframe)
    }

    res.json({
      success: true,
      length: filteredLogs.length,
      logs: filteredLogs,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

/**
 * @openapi
 * /api/v1/log-file:
 *   get:
 *     tags: [Logs]
 *     summary: Download log file.
 *     description: Download the log file containing all log entries.
 *     operationId: downloadLogFile
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Log file download.
 *       401:
 *         description: Unauthorized or insufficient permissions.
 */

router.get('/log-file', checkAuth, checkRoles('superadmin'), (req, res) => {
  const logFilePath = path.join(__dirname, '../../../../logs/all.log') // Adjust the path as needed
  const fileStream = fs.createReadStream(logFilePath)

  // Set response headers for downloading the log file
  res.setHeader('Content-Disposition', 'attachment; filename="all.log"')
  res.setHeader('Content-Type', 'text/plain')

  fileStream.pipe(res)
})

module.exports = router
