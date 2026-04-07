// routes/transactions.js
const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Transaction = require('../models/Transaction')
const { getSensorId } = require('../config/serial')

// POST /api/transactions
router.post('/', async (req, res) => {
  try {
    const { merchant, amount } = req.body

    // wait for sensor to return id
    const sensor_user_id = await getSensorId()

    // check if user exists
    const user = await User.findOne({ sensor_user_id })
    if (!user) {
      return res.status(404).json({ error: 'user not found' })
    }

    // check balance
    if (user.balance < amount) {
      await Transaction.create({ sensor_user_id, merchant, amount, status: 'declined' })
      return res.status(400).json({ error: 'insufficient balance', balance: user.balance })
    }

    // deduct balance
    user.balance -= amount
    await user.save()

    // save transaction
    await Transaction.create({ sensor_user_id, merchant, amount, status: 'success' })

    res.status(200).json({ message: 'transaction successful', balance: user.balance })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router