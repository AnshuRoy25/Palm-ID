// server.js
const express = require('express')
const cors = require('cors')
const { PORT } = require('./src/config/config')
const connectDB = require('./src/config/db')

const app = express()

connectDB()

app.use(cors())
app.use(express.json())

// routes 
app.use('/api/users', require('./src/routes/users'))
app.use('/api/transactions', require('./src/routes/transactions'))

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})