export default {
    data: {
        name: 'ping',
        description: 'Answers with Pong!',
    },
    async execute(interaction) {
        console.info(`${interaction} by ${interaction.user.username} (${interaction.user.id}) in ${interaction.guild.name}`);
        console.time(`cmd ${interaction} (${interaction.guild.name})`);

        await interaction.reply('Pong!');

        console.timeEnd(`cmd ${interaction} (${interaction.guild.name})`);
    },
};
