import { Client, Util } from 'discord.js'
import moment from 'moment'
import cache, { database } from './cache'
import sendLog from './sendLog'

const remindCronJob = async (client: Client, now: number) => {
  for (const jobId in cache.remindJobs) {
    const remindJob = cache.remindJobs[jobId]
    if (
      jobId === '_' ||
      !remindJob ||
      remindJob.clientId !== client.user?.id ||
      remindJob.remindAt > now ||
      remindJob.retryTimes > 2
    ) {
      continue
    }

    try {
      const user = await client.users.fetch(remindJob.userId)
      const guild = await client.guilds.fetch(remindJob.guildId)
      const channel = guild.channels.cache.get(remindJob.channelId)

      if (!channel?.isText()) {
        throw new Error('channel not found')
      }

      const targetMessage = await channel.messages.fetch(remindJob.messageId)

      const remindMessage = await user.send(
        'MEMBER_NAME `TIME` (GUILD_NAME / CHANNEL_NAME)\nMESSAGE_CONTENT\nMESSAGE_URL'
          .replace('MEMBER_NAME', Util.escapeMarkdown(targetMessage.member?.displayName || ''))
          .replace('TIME', moment(targetMessage.createdTimestamp).format('YYYY-MM-DD HH:mm'))
          .replace('GUILD_NAME', Util.escapeMarkdown(guild.name))
          .replace('CHANNEL_NAME', Util.escapeMarkdown(channel.name))
          .replace('MESSAGE_CONTENT', targetMessage.content)
          .replace('MESSAGE_URL', targetMessage.url),
      )
      await remindMessage.react('✅').catch(() => {})

      sendLog(client, {
        content: '[`TIME`] Execute remind job `JOB_ID`'
          .replace('TIME', moment(now).format('HH:mm:ss'))
          .replace('JOB_ID', jobId),
        guildId: remindJob.guildId,
        channelId: remindJob.channelId,
        userId: remindJob.userId,
        color: 0xffc078,
      })

      await database.ref(`/remindJobs/${jobId}`).remove()
    } catch (error) {
      await database.ref(`/remindJobs/${jobId}/retryTimes`).set(remindJob.retryTimes + 1)

      sendLog(client, {
        content: '[`TIME`] Execute remind job `JOB_ID`'
          .replace('TIME', moment(now).format('HH:mm:ss'))
          .replace('JOB_ID', jobId),
        guildId: remindJob.guildId,
        channelId: remindJob.channelId,
        userId: remindJob.userId,
        error,
      })
    }
  }
}

export default remindCronJob
