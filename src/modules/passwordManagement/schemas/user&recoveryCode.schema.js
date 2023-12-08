const mongoose = require('mongoose')

const userAndRecoveryCode = new mongoose.Schema({
  // Other user fields (e.g., name, email, password hash) can be added here
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },

  // Field for storing the recovery code and its expiration timestamp
  recoveryCode: {
    code: {
      type: String,
      default: null, // Initialize as null
    },
    expiresAt: {
      type: Date,
      default: null, // Initialize as null
    },
  },

  // Other user-related fields can be added here

  // Timestamps for created and updated fields
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('UserAndRecoveryCode', userAndRecoveryCode)
