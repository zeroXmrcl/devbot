export default {
    data: {
        name: 'url',
        description: 'URL Encodes a string.',
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
        if (interaction.options.getString('mode') === 'encode') {
            console.info(`${interaction} by ${interaction.user.username} (${interaction.user.id}) in ${interaction.guild.name}`);
            console.time(`cmd ${interaction} (${interaction.guild.name})`);

            const encoded = encodeURI(input);
            await interaction.reply(`${encoded}`);

            console.timeEnd(`cmd ${interaction} (${interaction.guild.name})`);
        } else if (interaction.options.getString('mode') === 'decode') {
            console.info(`${interaction} by ${interaction.user.username} (${interaction.user.id}) in ${interaction.guild.name}`);
            console.time(`cmd ${interaction} (${interaction.guild.name})`);

            const decoded = decodeURI(input);
            await interaction.reply(`${decoded}`);

            console.timeEnd(`cmd ${interaction} (${interaction.guild.name})`);
        } else {
            console.error(`WARNING: Invalid mode ${interaction.options.getString('mode')}`);
            interaction.reply(`Intern Error: Invalid mode (${mode})`);
        }
    },
};