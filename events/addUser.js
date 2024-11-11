/**
 * @module addUser
 */

const { ActionRowBuilder, UserSelectMenuBuilder, PermissionsBitField } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();
const getLocalizedMessage = require('../utils/getLocalizedMessage');

module.exports = {
  name: 'addUser',

  /**
   * @async
   * @function execute
   * @param {Client} client
   * @param {Interaction} interaction
   */
  async execute(client, interaction) {
    const locale = client.locale.get(client.config.language) || client.locale.get('en');

    if (interaction.isUserSelectMenu() && interaction.customId === 'addUser') {
      await interaction.deferReply({ ephemeral: true });

      const selectedUserId = interaction.values[0];

      if (!selectedUserId) {
        await interaction.editReply({ 
          content: getLocalizedMessage(locale, 'addUser.userNotSelected'), 
          ephemeral: true 
        });
        return;
      }

      const userToAdd = await interaction.guild.members.fetch(selectedUserId).catch(() => null);

      if (!userToAdd) {
        await interaction.editReply({ 
          content: getLocalizedMessage(locale, 'addUser.userNotFound'), 
          ephemeral: true 
        });
        return;
      }

      const channel = interaction.channel;
      const permissions = channel.permissionsFor(userToAdd);

      if (permissions && permissions.has(PermissionsBitField.Flags.ViewChannel)) {
        await interaction.editReply({ 
          content: getLocalizedMessage(locale, 'addUser.alreadyInChannel'), 
          ephemeral: true 
        });
        return;
      }

      try {
        await channel.permissionOverwrites.edit(userToAdd.id, {
          ViewChannel: true,
          SendMessages: true,
          ReadMessageHistory: true,
        });

        await interaction.editReply({
          content: getLocalizedMessage(locale, 'addUser.addedSuccessfully', { user: userToAdd.user.tag }),
          ephemeral: true,
        });

        try {
          await userToAdd.send({
            content: getLocalizedMessage(locale, 'addUser.dmNotification', { 
              user: userToAdd.user.username, 
              channel: channel.toString(), 
              guild: interaction.guild.name 
            }) 
              || `🎉 You've been added to the channel ${channel.toString()} in **${interaction.guild.name}**.`,
          });
        } catch (error) {
          console.error('Error sending DM to added user:', error);
        }
      } catch (error) {
        console.error('Error adding user to channel:', error);
        await interaction.editReply({ 
          content: getLocalizedMessage(locale, 'addUser.addFailed'), 
          ephemeral: true 
        });
      }
    } else {
      const userSelectMenu = new UserSelectMenuBuilder()
        .setCustomId('addUser')
        .setPlaceholder(getLocalizedMessage(locale, 'addUser.selectUserPlaceholder'))
        .setMinValues(1)
        .setMaxValues(1);

      const actionRow = new ActionRowBuilder().addComponents(userSelectMenu);

      await interaction.reply({
        content: getLocalizedMessage(locale, 'addUser.selectUserPrompt'),
        components: [actionRow],
        ephemeral: true,
      });
    }
  },
};
