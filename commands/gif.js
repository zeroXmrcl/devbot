/*
 * Copyright (c) 2026 zeroXmrcl (aka 0xmrcl)
 *
 * Licensed under a custom license.
 * Use is permitted for private and internal commercial purposes only.
 * Selling, sublicensing, or claiming this work as your own is prohibited.
 * See the LICENSE file for full terms.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink, readFile } from 'fs/promises';
import { randomBytes } from 'crypto';
import path from 'path';
import ffmpegPath from 'ffmpeg-static';
import pkg from 'discord.js';


const { InteractionResponseFlags } = pkg;


const execAsync = promisify(exec);

export default {
    data: {
        name: 'gif',
        description: 'Generates a gif on input. (Image/Video)',
        options: [
            {
                name: 'attachment',
                description: 'The image or video to convert to gif.',
                type: 11, // ATTACHMENT
                required: true,
            },
        ],
    },

    async execute(interaction) {
        const guildName = interaction.guild?.name ?? 'ELSE';

        console.time(`cmd ${interaction.commandName} (${guildName})`);
        console.info(
            `${interaction.commandName} by ${interaction.user.username} (${interaction.user.id}) in ${guildName}`
        );

        try {
            const attachment = interaction.options.getAttachment('attachment');


            if (!attachment) {
                return interaction.reply({
                    content: 'No attachment provided.',
                    flags: InteractionResponseFlags.Ephemeral,
                });
            }

            const validImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
            const validVideoTypes = ['video/mp4', 'video/webm', 'video/mov', 'video/avi', 'video/quicktime'];

            const contentType = attachment.contentType ?? '';
            const isImage = validImageTypes.includes(contentType);
            const isVideo = validVideoTypes.includes(contentType);

            if (!isImage && !isVideo) {
                return interaction.reply({
                    content: 'Invalid file type. Accepted formats: PNG, JPEG, JPG, WEBP, MP4, WEBM, MOV, AVI, QuickTime.',
                    flags: InteractionResponseFlags.Ephemeral,
                });
            }

            // → defer
            await interaction.deferReply();

            const response = await fetch(attachment.url);
            if (!response.ok) {
                return interaction.editReply({ content: `Fetch failed: ${response.status} ${response.statusText}` });
            }

            const buffer = await response.arrayBuffer();

            const tempId = randomBytes(16).toString('hex');
            const inputExt = path.extname(attachment.name || '') || (isVideo ? '.mp4' : '.png');
            const inputPath = `/tmp/input_${tempId}${inputExt}`;
            const outputPath = `/tmp/output_${tempId}.gif`;

            await writeFile(inputPath, Buffer.from(buffer));

            const ff = ffmpegPath;
            if (!ff) {
                return interaction.editReply({ content: 'ffmpeg-static did not resolve a binary path' });
            }

            const ffmpegCommand = isVideo
                ? `"${ff}" -i "${inputPath}" -vf "fps=15,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 "${outputPath}"`
                : `"${ff}" -i "${inputPath}" -vf "scale=480:-1:flags=lanczos" "${outputPath}"`;

            await execAsync(ffmpegCommand);

            const gifBuffer = await readFile(outputPath);

            await interaction.editReply({
                content: `Converted ${isVideo ? 'video' : 'image'} to GIF`,
                files: [{ attachment: gifBuffer, name: 'converted.gif' }],
            });

            await unlink(inputPath).catch(() => {});
            await unlink(outputPath).catch(() => {});
        } catch (err) {
            console.error('[ ERROR ]', err);

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ content: 'Error converting to GIF.' });
            } else {
                await interaction.reply({
                    content: 'Error converting to GIF.',
                    flags: InteractionResponseFlags.Ephemeral,
                });
            }
        }
    },
};