import { Buffer } from 'node:buffer';
import bs58 from 'bs58';

export default {
    data: {
        name: 'base58',
        description: 'Encodes a string to base58',
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
            result = bs58.encode(Buffer.from(input, 'utf-8'));
        } else {
            result = Buffer.from(bs58.decode(input)).toString('utf8');
        }
        
        await interaction.reply(`${result}`);
    },
};