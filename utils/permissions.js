const { PermissionsBitField } = require('discord.js');

/**
 * @param {GuildChannel} channel - The channel to set permissions on.
 * @param {string} userId - The ID of the user.
 */
const setUserPermissions = async (channel, userId) => {
  try {
    await channel.permissionOverwrites.edit(userId, {
      ViewChannel: true,
      Connect: true,
      Speak: true,
      MoveMembers: true,
    });
  } catch (error) {
    console.error(`❌ Failed to set user permissions for channel ${channel.id}:`, error);
  }
};

/**
 * @param {GuildChannel} channel - The channel to set permissions on.
 * @param {string} botId - The ID of the bot.
 */
const setBotPermissions = async (channel, botId) => {
  try {
    await channel.permissionOverwrites.edit(botId, {
      ViewChannel: true,
      Connect: true,
      Speak: true,
      ManageChannels: true,
      MoveMembers: true,
      ManageRoles: true,
    });
  } catch (error) {
    console.error(`❌ Failed to set bot permissions for channel ${channel.id}:`, error);
  }
};

module.exports = {
  setUserPermissions,
  setBotPermissions,
};