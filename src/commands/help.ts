import { Util } from 'discord.js'
import { CommandProps } from '../types'
import cache from '../utils/cache'

const commandHelp: CommandProps = async ({ guildId }) => {
  return {
    content: ':pushpin: Attention Please\n指令前綴：`PREFIX`\n說明文件：<MANUAL>\n開發群組：DISCORD'
      .replace('PREFIX', Util.escapeMarkdown(cache.settings[guildId]?.prefix || 'ap!'))
      .replace('MANUAL', 'https://hackmd.io/@eelayntris/attention-please')
      .replace('DISCORD', 'https://discord.gg/Ctwz4BB'),
  }
}

export default commandHelp
