const mineflayer = require('mineflayer')
const fetch = require('node-fetch')
const fs = require('fs')

const url = 'https://api.hypixel.net/status?key=ecf03ccb-a9e7-429c-ae88-b37446039133&uuid=07a3be94230e47438cf8f538c75de1a5'
const bot = mineflayer.createBot({
  host: 'mc.hypixel.net',
  username: 'colonelcool42',
  password: 'thomas1234',
  version: '1.16.5',
})

//-----------------------------------------------------------------------------
var DIGINTERVAL = 60
var MOVEINTERVAL = 37000
var REQUESTINTERVAL = 15000

//-----------------------------------------------------------------------------
var melonCount = 0
var moveDir = false
var controlStateInterval

//-----------------------------------------------------------------------------
bot.once('spawn', () => {
  console.log('Spawned')
  startFarm()
  setInterval(apiRequest, REQUESTINTERVAL)
  setTimeout(digBlockAtCursor, 10000)
})

//-----------------------------------------------------------------------------
async function digBlockAtCursor() {
  var block = bot.blockAtCursor(4)
  if (!block) {
    setTimeout(digBlockAtCursor, 5)
    return
  }
  if (block.name != 'melon' && block.name != 'carved_pumpkin') {
    setTimeout(digBlockAtCursor, 5)
    return
  }
  melonCount++
  if (melonCount % 50 == 0)
    console.log('Digging block [' + melonCount.toString() + ']')
  await bot.dig(block, 'ignore')
  setTimeout(digBlockAtCursor, DIGINTERVAL)
}

//-----------------------------------------------------------------------------
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

//-----------------------------------------------------------------------------
function startFarm() {
  clearInterval(controlStateInterval)
  bot.clearControlStates()
  moveDir = false

  setTimeout(() => { bot.chat('/skyblock'); console.log('/skyblock') }, 2000)
  setTimeout(() => { bot.chat('/warp home'); console.log('/warp home') }, 4000)
  setTimeout(() => {
    changeControlState()
    controlStateInterval = setInterval(changeControlState, MOVEINTERVAL)
  }, 10000)
}

//-----------------------------------------------------------------------------
async function apiRequest() {
  try {
    var response = await fetch(url)
    jReq = await response.json()

    console.log(jReq.session)
    if (jReq.session.mode != 'dynamic')
      startFarm()
  } catch (error) {
    console.log('api request failed')
  }
}

//-----------------------------------------------------------------------------
fs.readFile('./banner.txt', 'utf8', (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  console.log(data)
})

//-----------------------------------------------------------------------------
bot.on('kicked', console.log)
bot.on('error', console.log)
bot.on('end', console.log)