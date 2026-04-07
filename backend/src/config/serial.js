// config/serial.js
const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')

const port = new SerialPort({
  path: 'COM7',
  baudRate: 115200
})

const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }))

const getSensorId = () => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('sensor timeout'))
    }, 10000) // 10 seconds to scan

    parser.once('data', (data) => {
      clearTimeout(timeout)
      const parsed = JSON.parse(data.trim())
      if (parsed.status === 'ok') {
        resolve(parsed.sensor_user_id)
      } else {
        reject(new Error('scan failed'))
      }
    })
  })
}

module.exports = { getSensorId }