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
        console.info(`${interaction} by ${interaction.user.username} (${interaction.user.id}) in ${interaction.guild.name}`);
        console.time(`cmd ${interaction} (${interaction.guild.name})`);

        const input = interaction.options.getString('text');

        if (input) {
            const encrypted = crypto.createHash('sha256').update(input).digest('hex');
            await interaction.reply(`${encrypted}`);
        } else {
            await interaction.reply('No input provided.');
        }

        console.timeEnd(`cmd ${interaction} (${interaction.guild.name})`);
    },
};
