/*
 * Copyright (c) 2026 zeroXmrcl (aka 0xmrcl)
 *
 * Licensed under a custom license.
 * Use is permitted for private and internal commercial purposes only.
 * Selling, sublicensing, or claiming this work as your own is prohibited.
 * See the LICENSE file for full terms.
 */

import { Buffer } from 'node:buffer';
export default {
    data: {
        name: 'hex',
        description: 'Encodes a string to hex',
        options: [
            {
                name: 'mode',
                description: 'Choose whether to encode or decode',
                type: 3, // STRING
                required: true,
                choices: [
                    { name: 'Encode', value: 'encode' },
                    { name: 'Decode', value: 'decode' },
                ],
            },
            {
                name: 'text',
                description: 'The text to encode/decode',
                type: 3, // 3 = STRING
                required: true,
            },
        ],
    },
    async execute(interaction) {
        const input = interaction.options.getString('text');
        const mode = interaction.options.getString('mode');

        let result;
        if (mode === 'encode') {
            result = Buffer.from(input, 'utf-8').toString('hex');
        } else {
            result = Buffer.from(input, 'hex').toString('utf-8');
        }
        
        await interaction.reply(`${result}`);
    },
};