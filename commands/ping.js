export default {
    data: {
        name: 'ping',
        description: 'Answers with Pong!',
    },
    async execute(interaction) {
        await interaction.reply('Pong!');
    },
};
