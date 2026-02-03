/*
 * Copyright (c) 2026 zeroXmrcl (aka 0xmrcl)
 *
 * Licensed under a custom license.
 * Use is permitted for private and internal commercial purposes only.
 * Selling, sublicensing, or claiming this work as your own is prohibited.
 * See the LICENSE file for full terms.
 */

import process from 'node:process';
import os from 'node:os';
import pkg from '../package.json' with { type: 'json' };
import { EmbedBuilder, MessageFlags, version as djsVersion } from 'discord.js';
import {logColors} from "../bot.js";

function parseAdminIds(envValue) {
    if (!envValue) return [];
    return String(envValue)
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
}

function formatDuration(ms) {
    const s = Math.floor(ms / 1000);
    const days = Math.floor(s / 86400);
    const hours = Math.floor((s % 86400) / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    return [
        days ? `${days}d` : null,
        (days || hours) ? `${hours}h` : null,
        (days || hours || mins) ? `${mins}m` : null,
        `${secs}s`,
    ].filter(Boolean).join(' ');
}

function mb(n) {
    return `${Math.round((n / 1024 / 1024) * 10) / 10} MB`;
}

export default {
    data: {
        name: 'info',
        description: 'Shows bot info (admin only).',
    },

    async execute(interaction) {
        const adminIdsRaw = process.env.ADMIN_IDS;

        if (!adminIdsRaw || String(adminIdsRaw).trim() === '') {
            await interaction.reply({
                content: 'This command is disabled: `ADMIN_IDS` is not set (comma-separated user IDs).',
                flags: MessageFlags.Ephemeral,
            });
            console.log(`${logColors.WARN}[ WARN ]${logColors.RESET} Environment variable ADMIN_IDS is not set.`);
            return;
        }
        const adminIds = parseAdminIds(adminIdsRaw);

        if (adminIds.length === 0) {
            await interaction.reply({
                content: 'This command is disabled: `ADMIN_IDS` is empty/invalid. Set it to comma-separated user IDs.',
                flags: MessageFlags.Ephemeral,
            });
            console.log(`${logColors.WARN}[ WARN ]${logColors.RESET} Environment variable ADMIN_IDS is not valid.`);
            return;
        }
        if (!adminIds.includes(interaction.user.id)) {
            await interaction.reply({ content: 'You are not allowed to use this command.', flags: MessageFlags.Ephemeral });
            console.log(`${logColors.WARN}[ WARN ]${logColors.RESET} User was not allowed to use this command. User ID: ${interaction.user.id}`);
            return;
        }

        const client = interaction.client;
        const me = client.user;

        if (!me) {
            await interaction.reply({ content: 'Bot user is not ready yet.', flags: MessageFlags.Ephemeral });
            return;
        }

        const uptime = client.uptime ?? 0;
        const mem = process.memoryUsage();

        const guildCount = client.guilds.cache.size;
        const userCacheCount = client.users.cache.size;
        const channelCacheCount = client.channels.cache.size;

        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('Bot Instance Info')
            .setThumbnail(me.displayAvatarURL?.({ size: 256 }) ?? null)
            .addFields(
                {
                    name: 'Identity',
                    value: [`Tag: \`${me.tag}\``, `ID: \`${me.id}\``].join('\n'),
                    inline: false,
                },
                {
                    name: 'App/Build',
                    value: [`Bot version: \`v${pkg.version}\``, `discord.js: \`v${djsVersion}\``, `Node: \`${process.version}\``].join('\n'),
                    inline: true,
                },
                {
                    name: 'Runtime',
                    value: [`Uptime: \`${formatDuration(uptime)}\``, `PID: \`${process.pid}\``, `Platform: \`${process.platform} ${process.arch}\``].join('\n'),
                    inline: true,
                },
                {
                    name: 'Host',
                    value: [`OS: \`${os.type()} ${os.release()}\``, `CPU: \`${os.cpus()?.[0]?.model ?? 'unknown'}\``, `Cores: \`${os.cpus()?.length ?? 'unknown'}\``].join('\n'),
                    inline: false,
                },
                {
                    name: 'Memory',
                    value: [`RSS: \`${mb(mem.rss)}\``, `Heap: \`${mb(mem.heapUsed)}\` / \`${mb(mem.heapTotal)}\``, `External: \`${mb(mem.external)}\``].join('\n'),
                    inline: false,
                },
                {
                    name: 'Caches (approx)',
                    value: [`Guilds: \`${guildCount}\``, `Users cached: \`${userCacheCount}\``, `Channels cached: \`${channelCacheCount}\``].join('\n'),
                    inline: true,
                },
                {
                    name: 'Connection',
                    value: [`WS ping: \`${Math.round(client.ws.ping)}ms\``, `Ready at: \`${client.readyAt ? client.readyAt.toISOString() : 'unknown'}\``].join('\n'),
                    inline: true,
                },
            )
            .setFooter({ text: `Requested by ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    },
};