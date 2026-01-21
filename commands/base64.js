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
        name: 'base64',
        description: 'Encodes a string to base64',
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

        console.log(input, mode);

        let result;
        if (mode === 'encode') {
            result = Buffer.from(input, 'utf-8').toString('base64');
        } else {
            result = Buffer.from(input, 'base64').toString('utf-8');
        }
        
        await interaction.reply(`${result}`);
    },
};