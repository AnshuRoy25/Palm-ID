const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const readline = require('readline');

// ⚠️ Change this to your COM port
const PORT = 'COM7';
const BAUD  = 115200;

const port   = new SerialPort({ path: PORT, baudRate: BAUD });
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

let waitingForName = false;

// ── Send command to ESP32 ──
function sendCmd(cmd) {
  port.write(cmd + '\n', (err) => {
    if (err) console.error('❌ Write error:', err.message);
  });
}

// ── Show menu in terminal ──
function showMenu() {
  console.log('\n====== PALM ID SYSTEM ======');
  console.log('  1  →  Register new user');
  console.log('  2  →  Verify user');
  console.log('  0  →  Idle / Stop');
  console.log('  q  →  Quit');
  console.log('============================');
  console.log('Enter choice: ');
}

// ── Print ESP32 messages with colors ──
parser.on('data', (line) => {
  const msg = line.trim();
  if (!msg) return;

  const time = new Date().toLocaleTimeString();

  if (msg === 'SEND_NAME') {
    waitingForName = true;
    rl.question('👤 Enter name to register: ', (name) => {
      sendCmd(name.trim());
      waitingForName = false;
    });

  } else if (msg.includes('ACCESS_GRANTED'))  console.log(`✅ [${time}] ${msg}`);
  else if (msg.includes('SUCCESS'))            console.log(`✅ [${time}] ${msg}`);
  else if (msg.includes('FAILED'))             console.log(`❌ [${time}] ${msg}`);
  else if (msg.includes('DENIED'))             console.log(`❌ [${time}] ${msg}`);
  else if (msg.includes('UNKNOWN'))            console.log(`⚠️  [${time}] ${msg}`);
  else if (msg.includes('MODE'))               console.log(`🔄 [${time}] ${msg}`);
  else if (msg.includes('VERIFY'))             console.log(`🖐  [${time}] ${msg}`);
  else if (msg.includes('REGISTER'))           console.log(`📝 [${time}] ${msg}`);
  else if (msg === 'SHOW_PALM')                console.log(`🖐  [${time}] Show your palm to the sensor...`);
  else if (msg === 'ESP32_READY')              { console.log(`\n✅ [${time}] ESP32 Connected!\n`); showMenu(); }
  else                                         console.log(`📡 [${time}] ${msg}`);
});

// ── Handle keyboard input ──
process.stdin.on('data', (key) => {
  if (waitingForName) return;

  const cmd = key.toString().trim();

  if (cmd === 'q') {
    console.log('\n👋 Closing connection...');
    port.close();
    process.exit();
  }

  if (['0', '1', '2'].includes(cmd)) {
    sendCmd(cmd);
  } else if (cmd) {
    console.log('⚠️  Unknown key. Use 0, 1, 2 or q');
    showMenu();
  }
});

port.on('open', () => {
  console.log(`\n🔌 Connected to ESP32 on ${PORT} at ${BAUD} baud`);
  console.log('⏳ Waiting for ESP32 to boot...\n');
});

port.on('error', (err) => {
  console.error('❌ Port error:', err.message);
  console.log('👉 Check: Is ESP32 plugged in? Is the COM port correct? Is Arduino Serial Monitor closed?');
});

port.on('close', () => console.log('🔌 Port closed.'));