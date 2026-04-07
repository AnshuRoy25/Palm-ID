// models/Transaction.js
const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
  sensor_user_id: {
    type: Number,
    required: true
  },
  merchant: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'declined'],
    required: true
  }
}, { timestamps: true })

module.exports = mongoose.model('Transaction', transactionSchema)