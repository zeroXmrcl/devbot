import 'dotenv/config';
import {Client, GatewayIntentBits, REST, Routes, Events, ActivityType} from 'discord.js';
import fs from 'fs';
import path from 'path';
import url from 'url';

// --- CONFIG ---
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID; // App ID

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const settings = {
    activity: {
        status: 'online', // online, idle, dnd, invisible
        activityType: 'Streaming', // Playing, Streaming (requires a Twitch/YouTube link), Listening, Watching, Competing, Custom
        fallback: 'Playing',
        name: 'Powered by Discord.js!', // the text to display
        url: '', // Needed if activityType === 'Streaming'
    }
}
// --- CONFIG END ---

function getActivityType(typeString) {
    const types = {
        'Playing': ActivityType.Playing,
        'Streaming': ActivityType.Streaming,
        'Listening': ActivityType.Listening,
        'Watching': ActivityType.Watching,
        'Competing': ActivityType.Competing,
        'Custom': ActivityType.Custom
    };
    return types[typeString] || ActivityType.Playing;
}

function getActivityTypeName(typeNumber) {
    const types = {
        [ActivityType.Playing]: 'Playing',
        [ActivityType.Streaming]: 'Streaming',
        [ActivityType.Listening]: 'Listening',
        [ActivityType.Watching]: 'Watching',
        [ActivityType.Competing]: 'Competing',
        [ActivityType.Custom]: 'Custom'
    };
    return types[typeNumber] || 'Playing';
}

const logColors = {
    INFO: '\x1b[36m',    // Cyan
    ERROR: '\x1b[31m',   // Red
    WARN: '\x1b[33m',    // Yellow
    RESET: '\x1b[0m'     // Reset color
};

const cosmetic = {
    welcome() {
        console.log(`${logColors.INFO}------------- MSG -------------${logColors.RESET}`);

        console.log(`${logColors.INFO}[ INFO ]${logColors.RESET} Welcome!`)
        console.log(`${logColors.INFO}[ INFO ]${logColors.RESET} Made by 0xMRCL.`);

        console.log(`${logColors.INFO}------------- END -------------${logColors.RESET}`);
    }
}

if (!TOKEN || !CLIENT_ID) {
    console.error(`${logColors.ERROR}[ ERROR ]${logColors.ERROR} Environment missing: DISCORD_TOKEN and/or DISCORD_CLIENT_ID are not set.`);
    process.exit(1);
}

// --- Client ---
const client = new Client({intents: [GatewayIntentBits.Guilds]});

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
            console.warn(`${logColors.WARN}[ WARN ]${logColors.RESET} Skipping ${file}: expected { data: { name }, execute() }`);
            continue;
        }
        client.commands.set(command.data.name, command);
    }
} else {
    console.warn(`${logColors.WARN}[ WARN ]${logColors.RESET} Folder ./commands not found – create it and add command files.`);
}

console.log(`${logColors.INFO}[ INFO ]${logColors.RESET} ${client.commands.size} commands loaded: ${[...client.commands.keys()].join(', ') || '–'}`);

// 3) Register slash commands AFTER login
client.once(Events.ClientReady, async (c) => {
    console.log(`${logColors.INFO}[ INFO ]${logColors.RESET} Logged in as ${c.user.tag}`);

    // Set bot presence from settings
    if (settings.activity.name) {
        const presence = {
            activities: [{
                name: settings.activity.name,
                type: getActivityType(settings.activity.activityType)
            }],
            status: settings.activity.status || 'online'
        };

        // Add URL if the activity type is Streaming
        if (settings.activity.activityType === 'Streaming' && settings.activity.url) {
            console.log(`${logColors.INFO}[ INFO ]${logColors.RESET} Using Streaming presence. ${settings.activity.url}`)
            presence.activities[0].url = settings.activity.url;
        } else if (settings.activity.activityType === 'Streaming') {
            console.log(`${logColors.WARN}[ WARN ]${logColors.RESET} Tried to use streaming presence but no URL provided. Fallback to ${settings.activity.fallback}`)
            presence.activities[0].type = getActivityType(settings.activity.fallback);
        }

        c.user.setPresence(presence);
        console.log(`${logColors.INFO}[ INFO ]${logColors.RESET} Status set: ${getActivityTypeName()} ${settings.activity.name}`);
    }

    const rest = new REST({version: '10'}).setToken(TOKEN);
    try {
        const payload = [...client.commands.values()].map(cmd => cmd.data);
        console.log(`${logColors.INFO}[ INFO ]${logColors.RESET} Registering global commands...`);
        await rest.put(Routes.applicationCommands(CLIENT_ID), {body: payload});
        console.log(`${logColors.INFO}[ INFO ]${logColors.RESET} Successfully registered!`);
    } catch (err) {
        console.error(`${logColors.ERROR}[ ERROR ]${logColors.RESET} Error while registering:`, err);
    }
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    // Access command
    const command = client.commands?.get(interaction.commandName);
    if (!command) {
        console.warn(`${logColors.WARN}[ WARN ]${logColors.RESET} Unknown command: ${interaction.commandName}`);
        try {
            await interaction.reply({content: 'Unknown command.', ephemeral: true});
        } catch {
        }
        return;
    }

    try {
        console.log('----------- Process -----------');
        await command.execute(interaction);
        console.log('------------- END -------------');
    } catch (err) {
        console.error(`${logColors.ERROR}[ ERROR ]${logColors.RESET} Error in /${interaction.commandName}:`, err);
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply('There was an error executing this command.');
        } else {
            await interaction.reply({content: 'There was an error executing this command.', ephemeral: true});
        }
    }
});
client.on('error', (e) => console.error('Client error:', e));
client.login(TOKEN);
cosmetic.welcome();