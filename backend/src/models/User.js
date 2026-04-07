// models/User.js
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  sensor_user_id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    match: /^[6-9]\d{9}$/
  },
  balance: {
    type: Number,
    required: true,
    default: 0
  }
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)