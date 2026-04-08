// config/serial.js
const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')

const port = new SerialPort({ path: 'COM7', baudRate: 115200 })
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }))

// Pending operation queue — only one op at a time
let pendingOp = null  // { type: 'verify' | 'register', name?, resolve, reject, timer }

function sendCmd(cmd) {
  port.write(cmd + '\n', (err) => {
    if (err) console.error('Serial write error:', err.message)
  })
}

function clearPending(reason) {
  if (pendingOp) {
    clearTimeout(pendingOp.timer)
    const reject = pendingOp.reject
    pendingOp = null
    sendCmd('0')  // back to idle
    reject(new Error(reason))
  }
}

parser.on('data', (raw) => {
  const line = raw.trim()
  if (!line) return
  console.log('[ESP32]', line)

  if (!pendingOp) return  // nothing waiting, ignore

  const op = pendingOp

  if (op.type === 'verify') {
    if (line.startsWith('VERIFY:ACCESS_GRANTED')) {
      // next line will have the UID, but it might come as separate lines
      // handled below
    } else if (line.startsWith('VERIFY:UID:')) {
      // format: VERIFY:UID:3:NAME:Anshu
      const match = line.match(/VERIFY:UID:(\d+)/)
      if (match) {
        clearTimeout(op.timer)
        pendingOp = null
        sendCmd('0')
        op.resolve(parseInt(match[1]))
      }
    } else if (line === 'VERIFY:UNKNOWN_USER') {
      clearTimeout(op.timer)
      pendingOp = null
      sendCmd('0')
      op.reject(new Error('unknown user'))
    } else if (line.startsWith('VERIFY:FAILED')) {
      clearTimeout(op.timer)
      pendingOp = null
      sendCmd('0')
      op.reject(new Error('verification failed'))
    }

  } else if (op.type === 'register') {
    if (line.startsWith('SEND_NAME')) {
      // ESP32 is ready for the name
      sendCmd(op.name)
    } else if (line.startsWith('REGISTER:SUCCESS:UID:')) {
      // format: REGISTER:SUCCESS:UID:3:NAME:Anshu
      const match = line.match(/REGISTER:SUCCESS:UID:(\d+)/)
      if (match) {
        clearTimeout(op.timer)
        pendingOp = null
        sendCmd('0')
        op.resolve(parseInt(match[1]))
      }
    } else if (line === 'REGISTER:ALREADY_ENROLLED') {
      clearTimeout(op.timer)
      pendingOp = null
      sendCmd('0')
      op.reject(new Error('palm already enrolled'))
    } else if (line.startsWith('REGISTER:FAILED')) {
      clearTimeout(op.timer)
      pendingOp = null
      sendCmd('0')
      op.reject(new Error('registration failed'))
    }
  }
})

port.on('open', () => console.log('Serial port open on COM7'))
port.on('error', (err) => console.error('Serial port error:', err.message))

// ── Public API ──

// Called by verify routes (balance check, transaction)
// Returns: Promise<sensor_user_id>
function getSensorId(timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    if (pendingOp) {
      return reject(new Error('sensor busy'))
    }
    const timer = setTimeout(() => {
      pendingOp = null
      sendCmd('0')
      reject(new Error('sensor timeout'))
    }, timeoutMs)

    pendingOp = { type: 'verify', resolve, reject, timer }
    sendCmd('2')
  })
}

// Called by register route
// Returns: Promise<sensor_user_id>
function registerSensor(name, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    if (pendingOp) {
      return reject(new Error('sensor busy'))
    }
    const timer = setTimeout(() => {
      pendingOp = null
      sendCmd('0')
      reject(new Error('sensor timeout'))
    }, timeoutMs)

    pendingOp = { type: 'register', name, resolve, reject, timer }
    sendCmd('1')
  })
}

module.exports = { getSensorId, registerSensor }