const mongoose = require('mongoose')
const config = require('@src/config/config')

try {
  mongoose.connect(config.mongodb.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

  const db = mongoose.connection

  // Handle MongoDB connection events
  db.on('error', (error) => {
    console.error('MongoDB connection error:', error)
    // Handle the MongoDB connection error gracefully here
  })

  db.once('open', () => {
    console.log('Connected to MongoDB (ldapDB)')
  })

  // Handle closing the connection on application termination
  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      console.log('MongoDB connection disconnected through app termination')
      process.exit(0)
    })
  })
} catch (mongoError) {
  console.error('Error connecting to MongoDB:', mongoError)
  // Handle the MongoDB connection error gracefully here
}
