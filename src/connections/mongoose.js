const mongoose = require('mongoose')
const config = require('@src/config/config')

mongoose.connect(config.mongodb.url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const db = mongoose.connection

// Handle MongoDB connection events
db.on('error', console.error.bind(console, 'MongoDB connection error:'))
db.once('open', () => {
  console.log('Connected to MongoDB (ldapDB)')
})
