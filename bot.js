import 'dotenv/config';
import { Client, GatewayIntentBits, REST, Routes, Events } from 'discord.js';
import fs from 'fs';
import path from 'path';
import url from 'url';

// --- Base ---
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID; // App ID

if (!TOKEN || !CLIENT_ID) {
    console.error('[ ERROR ]Environment missing: DISCORD_TOKEN and/or DISCORD_CLIENT_ID are not set.');
    process.exit(1);
}

// __dirname in ESM
const __filename = url.fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// --- Client ---
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// 1) Command registry
client.commands = new Map();

// 2) Load command files
const commandsDir = path.join(__dirname, 'commands');
if (fs.existsSync(commandsDir)) {
    const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'));
    for (const file of files) {
        const mod = await import(new URL(`./commands/${file}`, import.meta.url));
        const command = mod.default ?? mod; // fallback if no default export was used
        if (!command?.data?.name || typeof command.execute !== 'function') {
            console.warn(`[ WARN ] Skipping ${file}: expected { data: { name }, execute() }`);
            continue;
        }
        client.commands.set(command.data.name, command);
    }
} else {
    console.warn('️[ WARN ] Folder ./commands not found – create it and add command files.');
}

console.log(`[ INFO ] ${client.commands.size} commands loaded: ${[...client.commands.keys()].join(', ') || '–'}`);

// 3) Register slash commands AFTER login
client.once(Events.ClientReady, async (c) => {
    console.log(`[ INFO ] Logged in as ${c.user.tag}`);
    console.log('------------- RUN -------------');

    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        const payload = [...client.commands.values()].map(cmd => cmd.data);
        console.log('[ INFO ] Registering global commands...');
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: payload });
        console.log('[ INFO ] Successfully registered!');
    } catch (err) {
        console.error('[ ERROR ] Error while registering:', err);
    }
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    // Access command
    const command = client.commands?.get(interaction.commandName);
    if (!command) {
        console.warn(`[ WARN ] Unknown command: ${interaction.commandName}`);
        try {
            await interaction.reply({ content: 'Unknown command.', ephemeral: true });
        } catch {}
        return;
    }

    try {
        console.log('----------- Process -----------');
        await command.execute(interaction);
        console.log('------------- END -------------');
    } catch (err) {
        console.error(`[ ERROR ] Error in /${interaction.commandName}:`, err);
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply('There was an error executing this command.');
        } else {
            await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
        }
    }
});
client.on('error', (e) => console.error('Client error:', e));
client.login(TOKEN);
