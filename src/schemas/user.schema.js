const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    // Fields from LDAP
    username: { type: String, lowercase: true },
    cn: { type: String },
    sn: { type: String },
    dn: { type: String },
    mail: { type: String, lowercase: true },

    // Array of login records
    registry: [
      {
        timestamp: { type: Date, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
)

const User = mongoose.model('User', userSchema)

module.exports.User = User
