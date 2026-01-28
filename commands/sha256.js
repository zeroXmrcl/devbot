/*
 * Copyright (c) 2026 zeroXmrcl (aka 0xmrcl)
 *
 * Licensed under a custom license.
 * Use is permitted for private and internal commercial purposes only.
 * Selling, sublicensing, or claiming this work as your own is prohibited.
 * See the LICENSE file for full terms.
 */

import crypto from 'crypto';

export default {
    data: {
        name: 'sha256',
        description: 'Hashes your String!',

        options: [
            {
                name: 'text',
                description: 'The text to hash',
                type: 3, // 3 = STRING
                required: true,
            },
        ],
    },
    async execute(interaction) {
        const input = interaction.options.getString('text');

        if (input) {
            const encrypted = crypto.createHash('sha256').update(input).digest('hex');
            await interaction.reply(`${encrypted}`);
        } else {
            await interaction.reply('No input provided.');
        }
    },
};
