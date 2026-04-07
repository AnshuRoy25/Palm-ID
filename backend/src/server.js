// server.js
const express = require('express')
const cors = require('cors')
const { PORT } = require('./config/config')
const connectDB = require('./config/db')

const app = express()

connectDB()

app.use(cors())
app.use(express.json())

// routes 
app.use('/api/users', require('./routes/users'))
app.use('/api/transactions', require('./routes/transactions'))

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})