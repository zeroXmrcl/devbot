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
                description: 'The text to encode',
                type: 3, // 3 = STRING
                required: true,
            },
        ],
    },
    async execute(interaction) {
        if (interaction.options.getString('mode') === 'encode') {
            const user = interaction.user;
            const input = interaction.options.getString('text');

            console.info(`${interaction} by ${user.username} (${user.id}) in ${interaction.guild.name}`);
            console.time(`cmd ${interaction} (${interaction.guild.name})`);

            const encoded = Buffer.from(input, 'utf-8').toString('base64');
            await interaction.reply(`${encoded}`);

            console.timeEnd(`cmd ${interaction} (${interaction.guild.name})`);
        } else if (interaction.options.getString('mode') === 'decode') {
            const user = interaction.user;
            const input = interaction.options.getString('text');

            console.info(`${interaction} by ${user.username} (${user.id}) in ${interaction.guild.name}`);
            console.time(`cmd ${interaction} (${interaction.guild.name})`);

            const decoded = Buffer.from(input, 'base64').toString('utf-8');
            await interaction.reply(`${decoded}`);

            console.timeEnd(`cmd ${interaction} (${interaction.guild.name})`);
        } else {
            console.error(`WARNING: Invalid mode`);
            interaction.reply(`Intern Error: Invalid mode (${interaction.options.getString('mode')})`);
        }
    },
};