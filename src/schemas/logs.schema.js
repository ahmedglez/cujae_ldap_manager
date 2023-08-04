const mongoose = require('mongoose')

const logSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      required: true,
    },
    level: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    versionKey: false,
  }
)

const Log = mongoose.model('Log', logSchema)

module.exports = Log
