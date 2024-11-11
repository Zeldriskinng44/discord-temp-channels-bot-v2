const {
  Events,
  ChannelType,
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();
const config = require('../config/config');
const getLocalizedMessage = require('../utils/getLocalizedMessage');

module.exports = {
  name: Events.VoiceStateUpdate,
  async execute(client, oldState, newState) {
    const guild = newState.guild;
    const member = newState.member;

    console.log(
      `VoiceStateUpdate - Guild: ${guild.id}, Old Channel: ${oldState.channelId}, New Channel: ${newState.channelId}`
    );

    if (!member) {
      console.warn(`⚠️ Member is undefined for voice state update in guild: ${guild.id}`);
      return;
    }

    const locale = client.locale.get(config.language) || client.locale.get('en');

    if (!oldState.channelId && newState.channelId === config.joinVoiceChannelId) {
      try {
        const channelName = `${member.user.username}'s Channel`;
        console.log(`Creating channel: ${channelName} for member: ${member.id}`);

        const tempChannel = await guild.channels.create({
          name: channelName,
          type: ChannelType.GuildVoice,
          parent: config.categoryId,
          permissionOverwrites: [
            {
              id: guild.id,
              deny: [PermissionsBitField.Flags.ViewChannel],
            },
            {
              id: member.id,
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.Connect,
                PermissionsBitField.Flags.Speak,
                PermissionsBitField.Flags.MoveMembers,
                PermissionsBitField.Flags.ManageChannels,
                PermissionsBitField.Flags.ManageRoles,
              ],
            },
            {
              id: client.user.id,
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.Connect,
                PermissionsBitField.Flags.Speak,
                PermissionsBitField.Flags.ManageChannels,
                PermissionsBitField.Flags.MoveMembers,
                PermissionsBitField.Flags.ManageRoles,
              ],
            },
          ],
        });

        console.log(`✅ Temporary voice channel created with ID: ${tempChannel.id}`);

        await member.voice.setChannel(tempChannel);
        console.log(`🔄 Moved member ${member.id} to channel ${tempChannel.id}`);

        const textChannel = await guild.channels.create({
          name: `${member.user.username}-text`,
          type: ChannelType.GuildText,
          parent: config.categoryId,
          permissionOverwrites: [
            {
              id: guild.id,
              deny: [PermissionsBitField.Flags.ViewChannel],
            },
            {
              id: member.id,
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ManageChannels,
                PermissionsBitField.Flags.ManageRoles,
              ],
            },
            {
              id: client.user.id,
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ManageChannels,
                PermissionsBitField.Flags.ManageRoles,
              ],
            },
          ],
        });

        console.log(`✅ Temporary text channel created with ID: ${textChannel.id}`);

        const embed = new EmbedBuilder()
          .setTitle(getLocalizedMessage(locale, 'controlPanel.title'))
          .setDescription(getLocalizedMessage(locale, 'controlPanel.description'))
          .setColor('#0099ff')
          .setImage('https://i.imgur.com/jaeJlPC.png')
          .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
          .setFooter({ text: `Channel Owner : ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
          .setTimestamp();

        embed.addFields(
          { name: 'Channel Name', value: tempChannel.name, inline: true },
          { name: 'Channel ID', value: tempChannel.id, inline: true }
        );

        const row1 = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`hide_${tempChannel.id}`)
            .setLabel(getLocalizedMessage(locale, 'buttons.hide'))
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId(`unhide_${tempChannel.id}`)
            .setLabel(getLocalizedMessage(locale, 'buttons.unhide'))
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId(`rename_${tempChannel.id}`)
            .setLabel(getLocalizedMessage(locale, 'buttons.rename'))
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId(`lock_${tempChannel.id}`)
            .setLabel(getLocalizedMessage(locale, 'buttons.lock'))
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId(`unlock_${tempChannel.id}`)
            .setLabel(getLocalizedMessage(locale, 'buttons.unlock'))
            .setStyle(ButtonStyle.Secondary)
        );

        const row2 = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`setLimit_${tempChannel.id}`)
            .setLabel(getLocalizedMessage(locale, 'buttons.setLimit'))
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId(`addMember_${tempChannel.id}`)
            .setLabel(getLocalizedMessage(locale, 'buttons.addMember'))
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId(`removeMember_${tempChannel.id}`)
            .setLabel(getLocalizedMessage(locale, 'buttons.removeMember'))
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId(`blacklist_${tempChannel.id}`)
            .setLabel(getLocalizedMessage(locale, 'buttons.blacklist'))
            .setStyle(ButtonStyle.Danger)
        );

        const row3 = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`delete_${tempChannel.id}`)
            .setLabel(getLocalizedMessage(locale, 'buttons.delete'))
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId(`transferOwnership_${tempChannel.id}`)
            .setLabel(getLocalizedMessage(locale, 'buttons.transferOwnership'))
            .setStyle(ButtonStyle.Primary)
        );

        await textChannel.send({ embeds: [embed], components: [row1, row2, row3] });
        console.log(`✅ Sent control panel in text channel: ${textChannel.id}`);

        await db.set(`channels_${guild.id}_${tempChannel.id}`, {
          voiceChannel: tempChannel.id,
          textChannel: textChannel.id,
          ownerId: member.id,
          blacklist: [],
        });
        console.log(`💾 Saved channel data for member: ${member.id}`);
      } catch (error) {
        console.error(`❌ Error in voiceStateUpdate:`, error);
      }
    }

    if (oldState.channelId && oldState.channelId !== newState.channelId) {
      try {
        const channelData = await db.get(`channels_${guild.id}_${oldState.channelId}`);

        if (channelData) {
          const voiceChannel = guild.channels.cache.get(channelData.voiceChannel);
          const textChannel = guild.channels.cache.get(channelData.textChannel);

          if (!voiceChannel) return;

          const ownerInVoiceChannel = voiceChannel.members.has(channelData.ownerId);

          if (voiceChannel.members.size === 0 || (!ownerInVoiceChannel && voiceChannel.members.size === 0)) {
            await voiceChannel.delete().catch(console.error);
            console.log(`🗑️ Deleted empty voice channel: ${voiceChannel.id}`);

            if (textChannel) {
              await textChannel.delete().catch(console.error);
              console.log(`🗑️ Deleted text channel: ${textChannel.id}`);
            }

            await db.delete(`channels_${guild.id}_${oldState.channelId}`);
            console.log(`💾 Deleted channel data for channel: ${oldState.channelId}`);
          }
        }
      } catch (error) {
        console.error(`❌ Error in voiceStateUpdate (leaving):`, error);
      }
    }
  },
};
