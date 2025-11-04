import QRCode from 'qrcode';
export default {
    data: {
        name: 'qrcode',
        description: 'Generates a QR Code. Can optionally URL encode.',
        options: [
            {
                name: 'text',
                description: 'The text to use.',
                type: 3, // 3 = STRING
                required: true,
            },
            {
                name: 'url',
                description: 'Whether to URL encode the text.',
                type: 5, // 5 = BOOLEAN
                required: false,
            }
        ],
    },
    async execute(interaction) {
        const input = interaction.options.getString('text');
        const shouldEncode = interaction.options.getBoolean('url');

        console.time(`cmd ${interaction} (${interaction.guild.name})`);
        console.info(`${interaction} by ${interaction.user.username} (${interaction.user.id}) in ${interaction.guild.name}`);
        try {
            const finalText = shouldEncode ? encodeURI(input) : input;

            const qrBuffer = await QRCode.toBuffer(finalText, {
                type: 'png',
                errorCorrectionLevel: 'H',
                margin: 1,
                scale: 8,
                width: 2048,
            });
            await interaction.reply({
                content: shouldEncode
                    ? `URL Encoded: Yes`
                    : `URL Encoded: No`,
                files: [
                    {attachment: qrBuffer, name: 'qrcode.png'}
                ],
            });
        } catch (err) {
            console.error(`[ ERROR ]`,err)
            await interaction.reply({
                content: 'Error generating QR Code.',
                ephemeral: true,
            });
        }

        console.timeEnd(`cmd ${interaction} (${interaction.guild.name})`);
    },
};