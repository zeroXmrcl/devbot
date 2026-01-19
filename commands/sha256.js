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

        console.log(input);

        if (input) {
            const encrypted = crypto.createHash('sha256').update(input).digest('hex');
            await interaction.reply(`${encrypted}`);
        } else {
            await interaction.reply('No input provided.');
        }
    },
};
