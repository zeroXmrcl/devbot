/*
 * Copyright (c) 2026 zeroXmrcl (aka 0xmrcl)
 *
 * Licensed under a custom license.
 * Use is permitted for private and internal commercial purposes only.
 * Selling, sublicensing, or claiming this work as your own is prohibited.
 * See the LICENSE file for full terms.
 */

export default {
    data: {
        name: 'ping',
        description: 'Answers with Pong!',
    },
    async execute(interaction) {
        await interaction.reply('Pong!');
    },
};
