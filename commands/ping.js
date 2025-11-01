export default {
    data: {
        name: 'ping',
        description: 'Answers with Pong!',
    },
    async execute(interaction) {
        const user = interaction.user;
        console.info(`${interaction} by ${user.username} (${user.id}) in ${interaction.guild.name}`);
        console.time(`cmd ${interaction} (${interaction.guild.name})`);

        await interaction.reply('Pong!');

        console.timeEnd(`cmd ${interaction} (${interaction.guild.name})`);
    },
};
