import { Client } from 'discord.js'
import moment from 'moment'
import config from './config'
import checkCronjob from './utils/checkCronjob'
import handleMessage from './utils/handleMessage'
import { handleRaw } from './utils/handleReaction'
import { loggerHook } from './utils/hooks'
import remindCronJob from './utils/remindCronJob'

moment.locale('zh-tw')
const client = new Client()

client.on('message', handleMessage)
client.on('raw', packet => handleRaw(client, packet))
client.on('ready', () => {
  loggerHook.send(
    '`TIME` USER_TAG'
      .replace('TIME', moment().format('YYYY-MM-DD HH:mm:ss'))
      .replace('USER_TAG', client.user?.tag || ''),
  )
  client.user?.setActivity('Version 2021.06.28 | https://discord.gg/Ctwz4BB')
})

let intervalLock = false
client.setInterval(async () => {
  if (intervalLock) {
    return
  }
  intervalLock = true
  const now = Date.now()
  await checkCronjob(client, now)
  await remindCronJob(client, now)
  intervalLock = false
}, 20000)

client.login(config.DISCORD.TOKEN)
