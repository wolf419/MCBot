const mineflayer = require('mineflayer')
const fs = require('fs')
const https = require('https')

const bot = mineflayer.createBot({
  host: 'mc.hypixel.net',
  username: 'colonelcool42',
  password: 'thomas1234',
  version: '1.16.5',
})

const options = {
  hostname: 'api.hypixel.net',
  port: 443,
  path: '/status?key=ecf03ccb-a9e7-429c-ae88-b37446039133&uuid=07a3be94230e47438cf8f538c75de1a5',
  method: 'GET'
}

var DIGINTERVAL = 80
var MOVEINTERVAL = 35000
var REQUESTINTERVAL = 10000

var digLock = 0
var moveDir = false
var melonCount = 0
var controlStateInterval
var digInterval

bot.once('spawn', () => {
  console.log('Spawned')
  startFarm()
  setInterval(sendReq, REQUESTINTERVAL)
})

function digBlockAtCursor() {
  bot.look(0, 0)
  var block = bot.blockAtCursor(4)

  if (!block || digLock == 1)
    return

  if (block.name == 'melon') {
    digLock = 1
    melonCount++
    console.log('Digging melon [' + melonCount.toString() + ']')
    try {
      bot.dig(block)
    } catch (error) {
      console.log(error)
    }
  }
}

bot.on('diggingCompleted', (block) => {
  digLock = 0
})

function changeControlState() {
  switch (moveDir) {
    case false:
      bot.clearControlStates()
      bot.setControlState('left', true)
      console.log('Move left')
      break;

    case true:
      bot.clearControlStates()
      bot.setControlState('right', true)
      console.log('Move right')
      break;
  }

  moveDir = !moveDir
}

function startFarm() {
  clearInterval(controlStateInterval)
  clearInterval(digInterval)
  moveDir = false

  setTimeout(() => { bot.chat('/skyblock'); console.log('/skyblock') }, 2000)
  setTimeout(() => { bot.chat('/warp home'); console.log('/warp home') }, 4000)
  setTimeout(() => {
    changeControlState()
    controlStateInterval = setInterval(changeControlState, MOVEINTERVAL)
  }, 10000)

  setTimeout(() => digInterval = setInterval(digBlockAtCursor, DIGINTERVAL), 10000)
}

function sendReq() {
  const req = https.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`)

    res.on('data', d => {
      try {
        var jsonObject = JSON.parse(d);
        if (jsonObject.session.mode != 'dynamic')
          startFarm()
      } catch (error) {
        console.log(error)
      }

    })
  })

  req.on('error', error => {
    console.error(error)
  })

  req.end()
}

fs.readFile('./banner.txt', 'utf8', (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  console.log(data)
})

// Log errors and kick reasons:
bot.on('kicked', console.log)
bot.on('error', console.log)
bot.on('end', console.log)