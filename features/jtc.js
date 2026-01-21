import { ChannelType } from 'discord.js';
import { logColors } from '../bot.js';

// Tracker
const tempChannels = new Map();

export default function (client) {
    // CONFIG
    const JTC_HUB_ID = process.env.JTC_HUB_ID;
    const JTC_CATEGORY_ID = process.env.JTC_CATEGORY_ID;
    // CONFIG END


    if (!JTC_HUB_ID || !JTC_CATEGORY_ID) {
        console.warn(`${logColors.WARN}[ JTC ]${logColors.RESET} Missing required config. Skipping...`);
        return;
    }

    client.on('voiceStateUpdate', async (oldState, newState) => {
        const { member, guild } = newState;

        // if User Joins the Hub Channel
        if (newState.channelId === JTC_HUB_ID) {
            // Check if permissions are met
            const me = guild.members.me;
            if (!me) {
                console.error(`${logColors.ERROR}[ JTC ]${logColors.RESET} Bot member not cached in guild: ${guild.name}`);
                return;
            }
            const missing = [];
            if (!me.permissions.has('ManageChannels')) missing.push('ManageChannels');
            if (!me.permissions.has('MoveMembers')) missing.push('MoveMembers');

            if (missing.length > 0) {
                console.error(
                    `${logColors.WARN}[ JTC ]${logColors.RESET} Missing permissions: ${missing.join(', ')} in guild: ${guild.name}`
                );
                return;
            }
            try {
                const voiceChannel = await guild.channels.create({
                    name: `${member.user.username}`,
                    type: ChannelType.GuildVoice,
                    parent: JTC_CATEGORY_ID,
                    userLimit: 0, // Optional userLimit of the created channel
                });

                // Move member to the new channel
                await member.voice.setChannel(voiceChannel);

                // Track this channel
                tempChannels.set(voiceChannel.id, member.id);
                console.log(`${logColors.INFO}[ JTC ]${logColors.RESET} Created channel: ${voiceChannel.name}`);
            } catch (err) {
                console.error(`${logColors.WARN}[ JTC ]${logColors.RESET} Error creating channel:`, err);
            }
        }

        // 2. User Leaves a Channel
        if (oldState.channelId && oldState.channelId !== newState.channelId) {
            const oldChannel = oldState.channel;

            // If tracked channel and now empty
            if (tempChannels.has(oldState.channelId) && oldChannel.members.size === 0) {
                try {
                    await oldChannel.delete();
                    tempChannels.delete(oldState.channelId);
                    console.log(`${logColors.INFO}[ JTC ]${logColors.RESET} Deleted channel: ${oldChannel.name}`);
                } catch (err) {
                    console.error(`${logColors.WARN}[ JTC ]${logColors.RESET} Error deleting channel:`, err);
                }
            }
        }
    });
};