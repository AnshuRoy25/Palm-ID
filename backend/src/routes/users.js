// routes/users.js
const express = require('express')
const router = express.Router()
const User = require('../models/User')
const { getSensorId, registerSensor } = require('../config/serial')

// POST /api/users/register
router.post('/register', async (req, res) => {
  try {
    const { name, mobile, balance } = req.body

    // check mobile first before touching sensor
    const existingMobile = await User.findOne({ mobile })
    if (existingMobile) {
      return res.status(400).json({ error: 'mobile already registered' })
    }

    // now scan palm for registration
    const sensor_user_id = await registerSensor(name)

    // check if sensor_user_id already registered
    const existingUser = await User.findOne({ sensor_user_id })
    if (existingUser) {
      return res.status(400).json({ error: 'palm already registered to another account' })
    }

    const user = new User({ sensor_user_id, name, mobile, balance: balance ?? 0 })
    await user.save()

    res.status(201).json({ message: 'user registered', user })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET /api/users/balance
router.get('/balance', async (req, res) => {
  try {
    const sensor_user_id = await getSensorId()

    const user = await User.findOne({ sensor_user_id })
    if (!user) {
      return res.status(404).json({ error: 'user not found' })
    }

    res.status(200).json({ name: user.name, balance: user.balance })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router