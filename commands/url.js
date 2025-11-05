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
        
        console.info(`${interaction} by ${interaction.user.username} (${interaction.user.id}) in ${interaction.guild.name}`);
        console.time(`cmd ${interaction} (${interaction.guild.name})`);

        let result;
        if (mode === 'encode') {
            result = encodeURI(input);
        } else {
            result = decodeURI(input);
        }
        
        await interaction.reply(`${result}`);
        console.timeEnd(`cmd ${interaction} (${interaction.guild.name})`);
    },
};