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

digLock = 0
moveDir = false
controlStateInterval

bot.once('spawn', () => {
  console.log('Spawned')
  setTimeout(() => {bot.chat('/skyblock');console.log('/skyblock')}, 2000)
  setTimeout(() => {bot.chat('/warp home'); console.log('/warp home')}, 4000)

  setTimeout(() => {
    changeControlState()
    controlStateInterval = setInterval(changeControlState, 35000)
  }, 5000)

  setTimeout(startDigging, 5000)
  setInterval(sendReq, 30000)
})

function dig () {
  bot.look(0,0)
  var block = bot.blockAtCursor(4)
    
  if (!block || digLock == 1)
    return

  if (block.name == 'melon')
  {
    digLock = 1
    console.log('Digging melon [' + Date.now() + ']')
    bot.dig(block)
  }
}

function startDigging() {
    var rand = Math.round(Math.random() * 50) + 100;
    setTimeout(() => {
      dig();
      startDigging();
    }, rand);
}

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

bot.on('diggingCompleted', (block) => {
  digLock = 0
})

fs.readFile('./banner.txt', 'utf8' , (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  console.log(data)
})

function sendReq() {
  const req = https.request(options, res => {
      console.log(`statusCode: ${res.statusCode}`)
    
      res.on('data', d => {
        var jsonObject = JSON.parse(d);
        if (jsonObject.session.mode != 'dynamic')
        {
          clearInterval(controlStateInterval)
          moveDir = false
          setTimeout(() => {bot.chat('/skyblock');console.log('/skyblock')}, 2000)
          setTimeout(() => {bot.chat('/warp home'); console.log('/warp home')}, 4000)

          setTimeout(() => {
            changeControlState()
            controlStateInterval = setInterval(changeControlState, 35000)
          }, 5000)
        }
      })
    })
    
  req.on('error', error => {
    console.error(error)
  })
  
  req.end()
}

// Log errors and kick reasons:
bot.on('kicked', console.log)
bot.on('error', console.log)
bot.on('end', console.log)