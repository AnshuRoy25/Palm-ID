// routes/transactions.js
const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Transaction = require('../models/Transaction')
const { getSensorId } = require('../config/serial')

// POST /api/transactions/verify - Step 1: Verify user and return details
router.post('/verify', async (req, res) => {
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
      return res.status(400).json({ 
        error: 'insufficient balance', 
        balance: user.balance,
        name: user.name,
        mobile: user.mobile
      })
    }

    // return user details for confirmation
    res.status(200).json({
      sensor_user_id: user.sensor_user_id,
      name: user.name,
      mobile: user.mobile,
      balance: user.balance,
      merchant,
      amount
    })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST /api/transactions/confirm - Step 2: Confirm and process transaction
router.post('/confirm', async (req, res) => {
  try {
    const { sensor_user_id, merchant, amount } = req.body

    // get user
    const user = await User.findOne({ sensor_user_id })
    if (!user) {
      return res.status(404).json({ error: 'user not found' })
    }

    // recheck balance
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