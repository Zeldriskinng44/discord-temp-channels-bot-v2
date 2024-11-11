const {
  Events,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  UserSelectMenuBuilder,
  PermissionsBitField,
} = require('discord.js');
const config = require('../config/config');
const getLocalizedMessage = require('../utils/getLocalizedMessage');

module.exports = {
  name: Events.InteractionCreate,
  async execute(client, interaction) {
    try {
      const locale = client.locale.get(client.config.language) || client.locale.get('en');

      if (!interaction.guild) return;

      const guild = interaction.guild;
      const member = interaction.member;

      const db = client.db;

      if (interaction.isButton()) {
        const [action, channelId] = interaction.customId.split('_');

        console.log(`Button Interaction - Action: ${action}, Channel ID: ${channelId}`);

        const channelData = await db.get(`channels_${guild.id}_${channelId}`);

        if (!channelData) {
          console.warn(`Channel data not found for key: channels_${guild.id}_${channelId}`);
          return interaction.reply({
            content: getLocalizedMessage(locale, 'interactionCreate.channelDataNotFound'),
            ephemeral: true,
          });
        }

        const voiceChannel = guild.channels.cache.get(channelData.voiceChannel);
        const textChannel = guild.channels.cache.get(channelData.textChannel);
        const ownerId = channelData.ownerId;

        if (!voiceChannel) {
          console.warn(`Voice channel not found: ID ${channelData.voiceChannel}`);
          return interaction.reply({
            content: getLocalizedMessage(locale, 'interactionCreate.voiceChannelNotFound'),
            ephemeral: true,
          });
        }

        if (interaction.user.id !== ownerId) {
          console.warn(`User ${interaction.user.id} attempted to perform action without permission.`);
          return interaction.reply({
            content: getLocalizedMessage(locale, 'interactionCreate.permissionDenied'),
            ephemeral: true,
          });
        }

        switch (action) {
          case 'hide':
            try {
              await voiceChannel.permissionOverwrites.edit(guild.id, {
                ViewChannel: false,
              });
              await interaction.reply({
                content: getLocalizedMessage(locale, 'interactionCreate.channelHidden'),
                ephemeral: true,
              });
              console.log(`Channel ${voiceChannel.id} hidden successfully.`);
            } catch (error) {
              console.error('Error hiding channel:', error);
              await interaction.reply({
                content: getLocalizedMessage(locale, 'errors.operationFailed'),
                ephemeral: true,
              });
            }
            break;

          case 'unhide':
            try {
              await voiceChannel.permissionOverwrites.edit(guild.id, {
                ViewChannel: true,
              });
              await interaction.reply({
                content: getLocalizedMessage(locale, 'interactionCreate.channelUnhidden'),
                ephemeral: true,
              });
              console.log(`Channel ${voiceChannel.id} unhidden successfully.`);
            } catch (error) {
              console.error('Error unhiding channel:', error);
              await interaction.reply({
                content: getLocalizedMessage(locale, 'errors.operationFailed'),
                ephemeral: true,
              });
            }
            break;

          case 'rename':
            try {
              const renameModal = new ModalBuilder()
                .setCustomId(`renameModal_${voiceChannel.id}`)
                .setTitle(getLocalizedMessage(locale, 'modals.renameTitle'));

              const renameInput = new TextInputBuilder()
                .setCustomId('newName')
                .setLabel(getLocalizedMessage(locale, 'modals.renameLabel'))
                .setStyle(TextInputStyle.Short)
                .setMinLength(1)
                .setMaxLength(100)
                .setPlaceholder(getLocalizedMessage(locale, 'modals.renamePlaceholder'))
                .setRequired(true);

              const renameActionRow = new ActionRowBuilder().addComponents(renameInput);
              renameModal.addComponents(renameActionRow);

              await interaction.showModal(renameModal);
              console.log(`Rename modal shown for channel ${voiceChannel.id}.`);
            } catch (error) {
              console.error('Error showing rename modal:', error);
              await interaction.reply({
                content: getLocalizedMessage(locale, 'errors.operationFailed'),
                ephemeral: true,
              });
            }
            break;

          case 'lock':
            try {
              await voiceChannel.permissionOverwrites.edit(guild.id, {
                Connect: false,
              });
              await interaction.reply({
                content: getLocalizedMessage(locale, 'interactionCreate.channelLocked'),
                ephemeral: true,
              });
              console.log(`Channel ${voiceChannel.id} locked successfully.`);
            } catch (error) {
              console.error('Error locking channel:', error);
              await interaction.reply({
                content: getLocalizedMessage(locale, 'errors.operationFailed'),
                ephemeral: true,
              });
            }
            break;

          case 'unlock':
            try {
              await voiceChannel.permissionOverwrites.edit(guild.id, {
                Connect: true,
              });
              await interaction.reply({
                content: getLocalizedMessage(locale, 'interactionCreate.channelUnlocked'),
                ephemeral: true,
              });
              console.log(`Channel ${voiceChannel.id} unlocked successfully.`);
            } catch (error) {
              console.error('Error unlocking channel:', error);
              await interaction.reply({
                content: getLocalizedMessage(locale, 'errors.operationFailed'),
                ephemeral: true,
              });
            }
            break;

          case 'setLimit':
            try {
              const limitModal = new ModalBuilder()
                .setCustomId(`limitModal_${voiceChannel.id}`)
                .setTitle(getLocalizedMessage(locale, 'modals.setLimitTitle'));

              const limitInput = new TextInputBuilder()
                .setCustomId('newLimit')
                .setLabel(getLocalizedMessage(locale, 'modals.setLimitLabel'))
                .setStyle(TextInputStyle.Short)
                .setPlaceholder(getLocalizedMessage(locale, 'modals.setLimitPlaceholder'))
                .setRequired(true);

              const limitActionRow = new ActionRowBuilder().addComponents(limitInput);
              limitModal.addComponents(limitActionRow);

              await interaction.showModal(limitModal);
              console.log(`Set limit modal shown for channel ${voiceChannel.id}.`);
            } catch (error) {
              console.error('Error showing set limit modal:', error);
              await interaction.reply({
                content: getLocalizedMessage(locale, 'errors.operationFailed'),
                ephemeral: true,
              });
            }
            break;

          case 'addMember':
            try {
              const userSelect = new UserSelectMenuBuilder()
                .setCustomId(`addMember_select_${channelId}`)
                .setPlaceholder(getLocalizedMessage(locale, 'addUser.selectUserPlaceholder'))
                .setMinValues(1)
                .setMaxValues(25);

              const addMemberRow = new ActionRowBuilder().addComponents(userSelect);

              await interaction.reply({
                content: getLocalizedMessage(locale, 'addUser.selectUserPrompt'),
                components: [addMemberRow],
                ephemeral: true,
              });
              console.log(`Add member select menu shown for channel ${voiceChannel.id}.`);
            } catch (error) {
              console.error('Error handling addMember action:', error);
              await interaction.reply({
                content: getLocalizedMessage(locale, 'errors.operationFailed'),
                ephemeral: true,
              });
            }
            break;

          case 'removeMember':
            try {
              const voiceChannelMembers = voiceChannel.members.filter((m) => m.id !== interaction.user.id);

              if (voiceChannelMembers.size === 0) {
                console.warn(`No members to remove in channel ${voiceChannel.id}.`);
                return interaction.reply({
                  content: getLocalizedMessage(locale, 'removeMember.noMembersInChannel'),
                  ephemeral: true,
                });
              }

              const userSelect = new UserSelectMenuBuilder()
                .setCustomId(`removeMember_select_${channelId}`)
                .setPlaceholder(getLocalizedMessage(locale, 'removeMember.selectUserPlaceholder'))
                .setMinValues(1)
                .setMaxValues(25)
                .setDisabled(false);

              const actionRow = new ActionRowBuilder().addComponents(userSelect);

              await interaction.reply({
                content: getLocalizedMessage(locale, 'removeMember.selectUserPrompt'),
                components: [actionRow],
                ephemeral: true,
              });
              console.log(`Remove member select menu shown for channel ${voiceChannel.id}.`);
            } catch (error) {
              console.error('Error handling removeMember action:', error);
              await interaction.reply({
                content: getLocalizedMessage(locale, 'errors.operationFailed'),
                ephemeral: true,
              });
            }
            break;

          case 'blacklist':
            try {
              const userSelect = new UserSelectMenuBuilder()
                .setCustomId(`blacklist_select_${channelId}`)
                .setPlaceholder(getLocalizedMessage(locale, 'blacklist.selectUserPlaceholder'))
                .setMinValues(1)
                .setMaxValues(25);

              const actionRow = new ActionRowBuilder().addComponents(userSelect);

              await interaction.reply({
                content: getLocalizedMessage(locale, 'blacklist.selectUserPrompt'),
                components: [actionRow],
                ephemeral: true,
              });
              console.log(`Blacklist select menu shown for channel ${voiceChannel.id}.`);
            } catch (error) {
              console.error('Error handling blacklist action:', error);
              await interaction.reply({
                content: getLocalizedMessage(locale, 'errors.operationFailed'),
                ephemeral: true,
              });
            }
            break;

          case 'delete':
            try {
              const deleteConfirmationRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setCustomId(`confirmDelete_${channelId}`)
                  .setLabel(getLocalizedMessage(locale, 'deleteConfirmation.confirmDelete') || '✅ Yes')
                  .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                  .setCustomId(`cancelDelete_${channelId}`)
                  .setLabel(getLocalizedMessage(locale, 'deleteConfirmation.cancelDelete') || '❌ No')
                  .setStyle(ButtonStyle.Secondary)
              );

              const deleteEmbed = new EmbedBuilder()
                .setTitle(getLocalizedMessage(locale, 'deleteConfirmation.title') || '🗑️ Delete Confirmation')
                .setDescription(
                  getLocalizedMessage(locale, 'deleteConfirmation.prompt') ||
                    '⚠️ **Are you sure you want to delete this channel?**'
                )
                .setColor('#ff0000');

              await interaction.reply({
                embeds: [deleteEmbed],
                components: [deleteConfirmationRow],
                ephemeral: true,
              });
              console.log(`Delete confirmation sent for channel ${voiceChannel.id}.`);
            } catch (error) {
              console.error('Error initiating delete confirmation:', error);
              await interaction.reply({
                content: getLocalizedMessage(locale, 'errors.operationFailed'),
                ephemeral: true,
              });
            }
            break;

          case 'confirmDelete':
            try {
              if (voiceChannel) await voiceChannel.delete();
              if (textChannel) await textChannel.delete();

              await db.delete(`channels_${guild.id}_${channelId}`);

              await interaction.reply({
                content: getLocalizedMessage(locale, 'deleteConfirmation.deletionSuccess') || '✅ Channel deleted successfully.',
                ephemeral: true,
              });
              console.log(`Channel ${voiceChannel.id} and text channel ${textChannel.id} deleted successfully.`);
            } catch (error) {
              console.error('Error deleting channels:', error);
              await interaction.reply({
                content: getLocalizedMessage(locale, 'errors.operationFailed'),
                ephemeral: true,
              });
            }
            break;

          case 'cancelDelete':
            try {
              await interaction.reply({
                content: getLocalizedMessage(locale, 'deleteConfirmation.deletionCanceled'),
                ephemeral: true,
              });
              console.log(`Delete operation canceled for channel ${voiceChannel.id}.`);
            } catch (error) {
              console.error('Error canceling delete:', error);
              await interaction.reply({
                content: getLocalizedMessage(locale, 'errors.operationFailed'),
                ephemeral: true,
              });
            }
            break;

          case 'transferOwnership':
            try {
              const voiceChannelMembers = voiceChannel.members.filter((m) => m.id !== interaction.user.id);

              if (voiceChannelMembers.size === 0) {
                console.warn(`No eligible members to transfer ownership in channel ${voiceChannel.id}.`);
                return interaction.reply({
                  content: getLocalizedMessage(locale, 'transferOwnership.noEligibleMembers'),
                  ephemeral: true,
                });
              }

              const userSelect = new UserSelectMenuBuilder()
                .setCustomId(`transferOwnership_select_${channelId}`)
                .setPlaceholder(getLocalizedMessage(locale, 'transferOwnership.selectUserPlaceholder'))
                .setMinValues(1)
                .setMaxValues(1);

              const actionRow = new ActionRowBuilder().addComponents(userSelect);

              await interaction.reply({
                content:
                  getLocalizedMessage(locale, 'transferOwnership.selectUserPrompt') ||
                  '🔍 Please select a user to transfer ownership to:',
                components: [actionRow],
                ephemeral: true,
              });
              console.log(`Transfer ownership select menu shown for channel ${voiceChannel.id}.`);
            } catch (error) {
              console.error('Error showing transfer ownership user select menu:', error);
              await interaction.reply({
                content: getLocalizedMessage(locale, 'errors.operationFailed'),
                ephemeral: true,
              });
            }
            break;

          default:
            console.warn(`Unknown action received: ${action}`);
            await interaction.reply({
              content: getLocalizedMessage(locale, 'errors.unknownAction'),
              ephemeral: true,
            });
        }
      }
      else if (interaction.isUserSelectMenu()) {
        const parts = interaction.customId.split('_');

        console.log(`User Select Menu Interaction - Parts: ${parts}`);

        let action, subaction, channelId;

        if (parts.length === 3) {
          [action, subaction, channelId] = parts;
        } else if (parts.length === 2) {
          [action, channelId] = parts;
          subaction = null;
        } else {
          console.warn(`Unexpected customId format: ${interaction.customId}`);
          return interaction.reply({
            content: getLocalizedMessage(locale, 'errors.unknownAction'),
            ephemeral: true,
          });
        }

        const db = client.db;

        if (action === 'addMember' && subaction === 'select') {
          await interaction.deferReply({ ephemeral: true });

          const selectedUserIds = interaction.values;

          if (!selectedUserIds || selectedUserIds.length === 0) {
            await interaction.editReply({
              content: getLocalizedMessage(locale, 'addUser.userNotSelected'),
              ephemeral: true,
            });
            return;
          }

          try {
            const channelData = await db.get(`channels_${guild.id}_${channelId}`);

            if (!channelData) {
              console.warn(`Channel data not found for key: channels_${guild.id}_${channelId}`);
              return interaction.editReply({
                content: getLocalizedMessage(locale, 'interactionCreate.channelDataNotFound'),
                ephemeral: true,
              });
            }

            const voiceChannel = guild.channels.cache.get(channelData.voiceChannel);
            const textChannel = guild.channels.cache.get(channelData.textChannel);
            const ownerId = channelData.ownerId;

            if (!voiceChannel || !textChannel) {
              console.warn(`Voice or Text channel not found for channelId: ${channelId}`);
              return interaction.editReply({
                content: getLocalizedMessage(locale, 'interactionCreate.voiceChannelNotFound'),
                ephemeral: true,
              });
            }

            if (interaction.user.id !== ownerId) {
              console.warn(`User ${interaction.user.id} attempted to add members without permission.`);
              return interaction.editReply({
                content: getLocalizedMessage(locale, 'interactionCreate.permissionDenied'),
                ephemeral: true,
              });
            }

            const addedMembers = [];
            const alreadyInChannel = [];
            const failedToAdd = [];

            for (const userId of selectedUserIds) {
              const user = await guild.members.fetch(userId).catch(() => null);
              if (!user) {
                failedToAdd.push(`❌ User with ID ${userId} not found.`);
                continue;
              }

              if (channelData.blacklist && channelData.blacklist.includes(userId)) {
                failedToAdd.push(`❌ ${user.user.tag} is blacklisted.`);
                continue;
              }

              const permissions = voiceChannel.permissionsFor(user);
              if (permissions && permissions.has(PermissionsBitField.Flags.ViewChannel)) {
                alreadyInChannel.push(`⚠️ ${user.user.tag}`);
                continue;
              }

              try {
                await voiceChannel.permissionOverwrites.edit(user.id, {
                  ViewChannel: true,
                  Connect: true,
                  Speak: true,
                });

                await textChannel.permissionOverwrites.edit(user.id, {
                  ViewChannel: true,
                  SendMessages: true,
                  ReadMessageHistory: true,
                });

                addedMembers.push(`✅ ${user.user.tag}`);
                console.log(`User ${user.user.tag} added to channel ${voiceChannel.id}.`);
              } catch (error) {
                console.error(`Failed to add user ${user.user.tag}:`, error);
                failedToAdd.push(`❌ ${user.user.tag}`);
              }
            }

            let replyMessage = '';

            if (addedMembers.length > 0) {
              replyMessage += `✅ ${getLocalizedMessage(locale, 'addUser.addedSuccessfully').replace(
                '[user]',
                addedMembers.join(', ')
              )}\n`;
            }

            if (alreadyInChannel.length > 0) {
              replyMessage += `⚠️ ${getLocalizedMessage(locale, 'addUser.alreadyInChannel')}: ${alreadyInChannel.join(
                ', '
              )}.\n`;
            }

            if (failedToAdd.length > 0) {
              replyMessage += `❌ ${getLocalizedMessage(locale, 'addUser.addFailed')}: ${failedToAdd.join(', ')}.\n`;
            }

            await interaction.editReply({ content: replyMessage, ephemeral: true });
          } catch (error) {
            console.error('Error handling addMember select menu:', error);
            await interaction.editReply({
              content: getLocalizedMessage(locale, 'errors.operationFailed'),
              ephemeral: true,
            });
          }
        }
        else if (action === 'removeMember' && subaction === 'select') {
          await interaction.deferReply({ ephemeral: true });

          const selectedUserIds = interaction.values;

          if (!selectedUserIds || selectedUserIds.length === 0) {
            await interaction.editReply({
              content: getLocalizedMessage(locale, 'removeMember.userNotSelected'),
              ephemeral: true,
            });
            return;
          }

          try {
            const channelData = await db.get(`channels_${guild.id}_${channelId}`);

            if (!channelData) {
              console.warn(`Channel data not found for key: channels_${guild.id}_${channelId}`);
              return interaction.editReply({
                content: getLocalizedMessage(locale, 'interactionCreate.channelDataNotFound'),
                ephemeral: true,
              });
            }

            const voiceChannel = guild.channels.cache.get(channelData.voiceChannel);
            const ownerId = channelData.ownerId;

            if (!voiceChannel) {
              console.warn(`Voice channel not found: ID ${channelData.voiceChannel}`);
              return interaction.editReply({
                content: getLocalizedMessage(locale, 'interactionCreate.voiceChannelNotFound'),
                ephemeral: true,
              });
            }

            if (interaction.user.id !== ownerId) {
              console.warn(`User ${interaction.user.id} attempted to remove members without permission.`);
              return interaction.editReply({
                content: getLocalizedMessage(locale, 'interactionCreate.permissionDenied'),
                ephemeral: true,
              });
            }

            const removedMembers = [];
            const failedToRemove = [];

            for (const userId of selectedUserIds) {
              const memberToRemove = await guild.members.fetch(userId).catch(() => null);
              if (!memberToRemove) {
                failedToRemove.push(`❌ User with ID ${userId} not found.`);
                continue;
              }

              try {
                if (memberToRemove.voice.channel && memberToRemove.voice.channel.id === voiceChannel.id) {
                  await memberToRemove.voice.disconnect('Removed by channel owner');
                  removedMembers.push(`✅ ${memberToRemove.user.tag}`);
                  console.log(`User ${memberToRemove.user.tag} removed from channel ${voiceChannel.id}.`);
                } else {
                  failedToRemove.push(`❌ ${memberToRemove.user.tag} is not in the voice channel.`);
                }
              } catch (error) {
                console.error(`Failed to remove user ${memberToRemove.user.tag}:`, error);
                failedToRemove.push(`❌ ${memberToRemove.user.tag}`);
              }
            }

            let replyMessage = '';

            if (removedMembers.length > 0) {
              replyMessage += `✅ ${getLocalizedMessage(locale, 'removeMember.removedSuccessfully').replace(
                '[user]',
                removedMembers.join(', ')
              )}\n`;
            }

            if (failedToRemove.length > 0) {
              replyMessage += `❌ ${getLocalizedMessage(locale, 'removeMember.removeFailed')}: ${failedToRemove.join(', ')}.\n`;
            }

            await interaction.editReply({ content: replyMessage, ephemeral: true });
          } catch (error) {
            console.error('Error handling removeMember select menu:', error);
            await interaction.editReply({
              content: getLocalizedMessage(locale, 'errors.operationFailed'),
              ephemeral: true,
            });
          }
        }
        else if (action === 'transferOwnership' && subaction === 'select') {
          await interaction.deferReply({ ephemeral: true });

          const selectedUserId = interaction.values[0];

          if (!selectedUserId) {
            await interaction.editReply({
              content: getLocalizedMessage(locale, 'transferOwnership.userNotSelected') || '❌ No user was selected.',
              ephemeral: true,
            });
            return;
          }

          const newOwner = await guild.members.fetch(selectedUserId).catch(() => null);

          if (!newOwner) {
            await interaction.editReply({
              content: getLocalizedMessage(locale, 'transferOwnership.userNotFound') || '❌ The selected user was not found.',
              ephemeral: true,
            });
            return;
          }

          try {
            const channelData = await db.get(`channels_${guild.id}_${channelId}`);

            if (!channelData) {
              console.warn(`Channel data not found for key: channels_${guild.id}_${channelId}`);
              return interaction.editReply({
                content: getLocalizedMessage(locale, 'interactionCreate.channelDataNotFound'),
                ephemeral: true,
              });
            }

            const voiceChannel = guild.channels.cache.get(channelData.voiceChannel);
            const textChannel = guild.channels.cache.get(channelData.textChannel);
            const ownerId = channelData.ownerId;

            if (!voiceChannel || !textChannel) {
              console.warn(`Voice or Text channel not found for channelId: ${channelId}`);
              return interaction.editReply({
                content: getLocalizedMessage(locale, 'interactionCreate.voiceChannelNotFound'),
                ephemeral: true,
              });
            }

            if (interaction.user.id !== ownerId) {
              console.warn(`User ${interaction.user.id} attempted to transfer ownership without permission.`);
              return interaction.editReply({
                content: getLocalizedMessage(locale, 'interactionCreate.permissionDenied'),
                ephemeral: true,
              });
            }

            try {
              await voiceChannel.permissionOverwrites.edit(newOwner.id, {
                ManageChannels: true,
                ManageRoles: true,
              });
              await voiceChannel.permissionOverwrites.edit(ownerId, {
                ManageChannels: false,
                ManageRoles: false,
              });

              await textChannel.permissionOverwrites.edit(newOwner.id, {
                ManageChannels: true,
                ManageRoles: true,
              });
              await textChannel.permissionOverwrites.edit(ownerId, {
                ManageChannels: false,
                ManageRoles: false,
              });

              channelData.ownerId = newOwner.id;
              await db.set(`channels_${guild.id}_${channelId}`, channelData);

              await interaction.editReply({
                content:
                  getLocalizedMessage(locale, 'transferOwnership.success', { user: newOwner.user.tag }) ||
                  `✅ Ownership has been transferred to ${newOwner.user.tag}.`,
                ephemeral: true,
              });
              console.log(`Ownership of channel ${voiceChannel.id} transferred to ${newOwner.user.tag}.`);

              try {
                await newOwner.send({
                  content:
                    getLocalizedMessage(locale, 'transferOwnership.dmNotification', {
                      user: newOwner.user.username,
                      channel: voiceChannel.toString(),
                      guild: interaction.guild.name,
                    }) ||
                    `🎉 You've been made the owner of the channel ${voiceChannel.toString()} in **${interaction.guild.name}**.`,
                });
                console.log(`DM sent to new owner ${newOwner.user.tag}.`);
              } catch (error) {
                console.error('Error sending DM to new owner:', error);
              }

              try {
                const previousOwner = await guild.members.fetch(ownerId).catch(() => null);
                if (previousOwner) {
                  await previousOwner.send({
                    content:
                      getLocalizedMessage(locale, 'transferOwnership.previousOwnerNotification', {
                        user: newOwner.user.username,
                        channel: voiceChannel.toString(),
                        guild: interaction.guild.name,
                      }) ||
                      `🔄 Ownership of the channel ${voiceChannel.toString()} in **${interaction.guild.name}** has been transferred to ${newOwner.user.tag}.`,
                  });
                  console.log(`DM sent to previous owner ${previousOwner.user.tag}.`);
                }
              } catch (error) {
                console.error('Error sending DM to previous owner:', error);
              }
            } catch (error) {
              console.error('Error transferring ownership:', error);
              await interaction.editReply({
                content: getLocalizedMessage(locale, 'transferOwnership.transferFailed') || '❌ Failed to transfer ownership.',
                ephemeral: true,
              });
            }
          } catch (error) {
            console.error('Error fetching new owner:', error);
            await interaction.editReply({
              content: getLocalizedMessage(locale, 'errors.operationFailed'),
              ephemeral: true,
            });
          }
        }
        else {
          console.warn(`Unhandled User Select Menu action: ${action}`);
          await interaction.reply({
            content: getLocalizedMessage(locale, 'errors.unknownAction'),
            ephemeral: true,
          });
        }
      }
      else if (interaction.isModalSubmit()) {
        const [modalType, channelId] = interaction.customId.split('_');

        console.log(`Modal Submit Interaction - Modal Type: ${modalType}, Channel ID: ${channelId}`);

        const db = client.db;

        try {
          const channelData = await db.get(`channels_${guild.id}_${channelId}`);

          if (!channelData) {
            console.warn(`Channel data not found for key: channels_${guild.id}_${channelId}`);
            return interaction.reply({
              content: getLocalizedMessage(locale, 'interactionCreate.channelDataNotFound'),
              ephemeral: true,
            });
          }

          const voiceChannel = guild.channels.cache.get(channelData.voiceChannel);
          const ownerId = channelData.ownerId;

          if (!voiceChannel) {
            console.warn(`Voice channel not found: ID ${channelData.voiceChannel}`);
            return interaction.reply({
              content: getLocalizedMessage(locale, 'interactionCreate.voiceChannelNotFound'),
              ephemeral: true,
            });
          }

          if (interaction.user.id !== ownerId) {
            console.warn(`User ${interaction.user.id} attempted to submit modal without permission.`);
            return interaction.reply({
              content: getLocalizedMessage(locale, 'interactionCreate.permissionDenied'),
              ephemeral: true,
            });
          }

          switch (modalType) {
            case 'renameModal':
              const newName = interaction.fields.getTextInputValue('newName').trim();
              if (newName.length < 1 || newName.length > 100) {
                console.warn(`Invalid channel name length: ${newName.length}`);
                return interaction.reply({
                  content: getLocalizedMessage(locale, 'errors.invalidChannelName'),
                  ephemeral: true,
                });
              }

              try {
                await voiceChannel.setName(newName);
                await interaction.reply({
                  content: getLocalizedMessage(locale, 'voiceStateUpdate.channelRenamed', { newName }),
                  ephemeral: true,
                });
                console.log(`Channel ${voiceChannel.id} renamed to ${newName}.`);
              } catch (error) {
                console.error('Error renaming channel:', error);
                await interaction.reply({
                  content: getLocalizedMessage(locale, 'errors.operationFailed'),
                  ephemeral: true,
                });
              }
              break;

            case 'limitModal':
              const newLimitStr = interaction.fields.getTextInputValue('newLimit').trim();
              const newLimit = parseInt(newLimitStr, 10);

              if (isNaN(newLimit) || newLimit < 1 || newLimit > 99) {
                console.warn(`Invalid user limit: ${newLimitStr}`);
                return interaction.reply({
                  content: getLocalizedMessage(locale, 'errors.invalidUserLimit'),
                  ephemeral: true,
                });
              }

              try {
                await voiceChannel.setUserLimit(newLimit);
                await interaction.reply({
                  content: getLocalizedMessage(locale, 'voiceStateUpdate.userLimitSet', { newLimit }),
                  ephemeral: true,
                });
                console.log(`User limit for channel ${voiceChannel.id} set to ${newLimit}.`);
              } catch (error) {
                console.error('Error setting user limit:', error);
                await interaction.reply({
                  content: getLocalizedMessage(locale, 'errors.operationFailed'),
                  ephemeral: true,
                });
              }
              break;

            default:
              console.warn(`Unknown modal type: ${modalType}`);
              await interaction.reply({
                content: getLocalizedMessage(locale, 'errors.unknownAction'),
                ephemeral: true,
              });
          }
        } catch (error) {
          console.error('Error handling modal submission:', error);
          await interaction.reply({
            content: getLocalizedMessage(locale, 'errors.operationFailed'),
            ephemeral: true,
          });
        }
      }
    } catch (error) {
      console.error(`Error in interactionCreate:`, error);
      const locale = client.locale.get(config.language) || client.locale.get('en');

      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: getLocalizedMessage(locale, 'errors.operationFailed'),
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: getLocalizedMessage(locale, 'errors.operationFailed'),
            ephemeral: true,
          });
        }
      } catch (err) {
        console.error('Error sending error message to user:', err);
      }
    }
  },
};
