import 'dotenv/config';
import pkg from './package.json' with { type: 'json' };
import {Client, GatewayIntentBits, REST, Routes, Events, ActivityType, WebhookClient, EmbedBuilder} from 'discord.js';
import fs from 'fs';
import path from 'path';
import url from 'url';

const envBool = (v, def = false) =>
    v == null ? def : ['1','true','yes','on'].includes(String(v).toLowerCase());

const envStr = (v, def = '') =>
    (v == null || v === '') ? def : String(v);


// --- CONFIG ---
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const commandsDir = path.join(__dirname, 'commands');

const settings = {
    activity: {
        enabled: envBool(process.env.PRESENCE_ENABLE, false),
        status: envStr(process.env.PRESENCE_STATUS, 'online'),
        activityType: envStr(process.env.PRESENCE_ACTIVITY, 'Custom'),
        name: envStr(process.env.PRESENCE_NAME, `Released v${pkg.version}!`),
        url: envStr(process.env.PRESENCE_STREAMING_URL, ''),
    },
    loggingWebhook: {
        enabled: envBool(process.env.WEBHOOK_ENABLE, false),
        webhookURL: envStr(process.env.WEBHOOK_URL, ''),
        name: envStr(process.env.WEBHOOK_NAME, 'Bot Log'),
        avatarURL: envStr(process.env.WEBHOOK_AVATAR_URL, ''),
        footer: envStr(process.env.WEBHOOK_FOOTER, 'Client made by 0xmrcl'),
    },
    miscellaneous: {
        showWelcome: envBool(process.env.SHOW_WELCOME, true),
        activateFeatures: envBool(process.env.FEATURES_ENABLE, false),
    },
    version: pkg.version,
};

// -- CONFIG END ---

export const logColors = {
    INFO: '\x1b[36m',
    ERROR: '\x1b[31m',
    WARN: '\x1b[33m',
    RESET: '\x1b[0m'
};

process.on('unhandledRejection', (err) => {
    console.error(`${logColors.ERROR}[ ERROR ]${logColors.RESET} unhandledRejection:`, err);
});


process.on('uncaughtException', (err) => {
    console.error(`${logColors.ERROR}[ ERROR ]${logColors.RESET} uncaughtException:`, err);
    process.exit(1);
});

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

if (settings.miscellaneous.showWelcome) {
    console.log(`${logColors.INFO}------------- MSG -------------${logColors.RESET}`);

    console.log(`${logColors.INFO}[ INFO ]${logColors.RESET} Welcome!`)
    console.log(`${logColors.INFO}[ INFO ]${logColors.RESET} Made by 0xMRCL.`);
    console.log(`${logColors.INFO}[ INFO ]${logColors.RESET} Running version ${settings.version}.`);

    console.log(`${logColors.INFO}------------- END -------------${logColors.RESET}`);
}


if (!TOKEN || !CLIENT_ID) {
    console.error(`${logColors.ERROR}[ ERROR ]${logColors.RESET} Environment missing:`);
    if (!TOKEN) {
        console.error(`${logColors.ERROR}[ ERROR ]${logColors.RESET} DISCORD_TOKEN missing.`);
    }
    if (!CLIENT_ID) {
        console.error(`${logColors.ERROR}[ ERROR ]${logColors.RESET} DISCORD_CLIENT_ID missing.`);
    }
    process.exit(1);
}

// --- Client ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});
let logger = null;

if (settings.loggingWebhook.enabled && settings.loggingWebhook.webhookURL) {
    console.log(`${logColors.INFO}[ INFO ]${logColors.RESET} WebLogging enabled.`);
    logger = new WebhookClient({ url: settings.loggingWebhook.webhookURL });
} else {
    console.log(`${logColors.INFO}[ INFO ]${logColors.RESET} WebLogging disabled.`);
}

async function logToWebhook(options = {}) {
    if (!logger) return;

    const embed = new EmbedBuilder()
        .setColor(options.color || 0x0099FF) // Default blue
        .setTitle(options.title || 'System Notification')
        .setDescription(options.description || 'No details provided.')
        .setTimestamp()
        .setFooter({text: settings.loggingWebhook.footer || 'Default'});

    if (options.fields) embed.addFields(options.fields);

    try {
        await logger.send({
            embeds: [embed],
            username: settings.loggingWebhook.name || 'Default',
            avatarURL: settings.loggingWebhook.avatarURL,
        });
    } catch (err) {
        console.error(`${logColors.ERROR}[ ERROR ]${logColors.RESET} Webhook failed: ${err.message}`);
    }
}

// Attach to the client so commands can use it through interaction.client.logToWebhook()
client.logToWebhook = logToWebhook;

// Command Registry
async function registerCommands() {
    client.commands = new Map();

    // File locator
    if (fs.existsSync(commandsDir)) {
        const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'));
        for (const file of files) {
            const mod = await import(new URL(`./commands/${file}`, import.meta.url));
            const command = mod.default ?? mod; // fallback if no default export
            if (!command?.data?.name || typeof command.execute !== 'function') {
                console.warn(`${logColors.WARN}[ WARN ]${logColors.RESET} Skipping ${file}: expected { data: { name }, execute() }`);
                continue;
            }
            client.commands.set(command.data.name, command);
        }
    } else {
        console.warn(`${logColors.WARN}[ WARN ]${logColors.RESET} ${commandsDir} is not existing. Attempting to create it...`);
        try {
            fs.mkdirSync(commandsDir);
            console.log(`${logColors.INFO}[ INFO ]${logColors.RESET} ${commandsDir} created. Add your commands to it and restart the bot.`);
        } catch (error) {
            console.error(`${logColors.ERROR}[ ERROR ]${logColors.RESET} Failed to create: ${error.message}`);
            return;
        }
    }

    if (client.commands.size === 0) {
        console.warn(`${logColors.WARN}[ WARN ]${logColors.RESET} No commands found in ${commandsDir}.`);
        return;
    }

    console.log(`${logColors.INFO}[ INFO ]${logColors.RESET} ${client.commands.size} commands loaded: ${[...client.commands.keys()].join(', ') || '–'}`);
}

async function registerFeatures() {
    const featuresPath = path.join(__dirname, 'features');
    if (fs.existsSync(featuresPath)) {
        const featureFiles = fs.readdirSync(featuresPath).filter(file => file.endsWith('.js'));

        for (const file of featureFiles) {
            const mod = await import(new URL(`./features/${file}`, import.meta.url));
            const feature = mod.default ?? mod; 
            
            if (typeof feature === 'function') {
                feature(client);
                console.log(`${logColors.INFO}[ INFO ]${logColors.RESET} Loaded feature: ${file}`);
            }
        }
    }
}

// Presence Registry
client.once(Events.ClientReady, async (c) => {
    console.log(`${logColors.INFO}[ INFO ]${logColors.RESET} Logged in as ${c.user.tag}`);

    // Set bot presence from settings
    if (settings.activity.enabled) {
        const presence = {
            activities: [{
                name: settings.activity.name,
                type: getActivityType(settings.activity.activityType)
            }],
            status: settings.activity.status || 'online'
        };

        // if Streaming > Check URL
        if (settings.activity.activityType === 'Streaming' && settings.activity.url) {
            console.log(`${logColors.INFO}[ INFO ]${logColors.RESET} Using Streaming presence. ${settings.activity.url}`)
            presence.activities[0].url = settings.activity.url;
        } else if (settings.activity.activityType === 'Streaming') {
            console.log(`${logColors.WARN}[ WARN ]${logColors.RESET} Tried to use streaming presence but no URL provided. Presence not set.`)
            presence.activities = [];
        }
        // Set presence
        c.user.setPresence(presence);

        // Display Status set
        if (presence.activities.length > 0) {
            console.log(`${logColors.INFO}[ INFO ]${logColors.RESET} Status set: ${presence.status}; ${getActivityTypeName(presence.activities[0].type)}; ${presence.activities[0].name}`);
        } else {
            console.log(`${logColors.INFO}[ INFO ]${logColors.RESET} Status set: ${presence.status}; No activity`);
        }

    } else if (!settings.activity.enabled) {
        console.log(`${logColors.INFO}[ INFO ]${logColors.RESET} Presence disabled.`)
    }
    // Transmitter
        // Guard
    if (!client.commands || client.commands.size === 0) {
        console.log(`${logColors.WARN}[ WARN ]${logColors.RESET} No commands loaded; skipping global registration.`);
        return;
    }   // Transmit
    const rest = new REST({version: '10'}).setToken(TOKEN);
    try {
        const payload = [...client.commands.values()].map(cmd => cmd.data);
        console.log(`${logColors.INFO}[ INFO ]${logColors.RESET} Registering global commands...`);
        await rest.put(Routes.applicationCommands(CLIENT_ID), {body: payload});
        console.log(`${logColors.INFO}[ INFO ]${logColors.RESET} Successfully registered!`);
    } catch (err) {
        console.error(`${logColors.ERROR}[ ERROR ]${logColors.RESET} Registry ERR (Transmitter):`, err);
    }
});
// On command execution
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    // Access command
    const command = client.commands?.get(interaction.commandName);
    if (!command) {
        console.warn(`${logColors.WARN}[ WARN ]${logColors.RESET} Unknown command: ${interaction.commandName}`);
        try {
            await interaction.reply({content: 'Unknown command.', ephemeral: true});
        } catch {
            console.log(`${logColors.ERROR}[ ERROR ]${logColors.RESET} Failed to reply 'unknown command' message.`)
        }
        return;
    }

    // generate logging Identifier
    const logId = `[${interaction.commandName} | ${interaction.user.username} | ${interaction.id.slice(-5)}]`;

    try {
        console.log(`${logColors.INFO}----------- ${logId} S -----------${logColors.RESET}`);
        console.time(logId);

        await command.execute(interaction);

    } catch (err) {
        console.error(`${logColors.ERROR}[ ERROR ]${logId}:${logColors.RESET}`, err);
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply('There was an error executing this command.');
        } else {
            await interaction.reply({content: 'There was an error executing this command.', ephemeral: true});
        }
    } finally {
        console.timeEnd(logId);
        console.log(`${logColors.INFO}----------- ${logId} E -----------${logColors.RESET}`);
        // Log to Webhook
        await client.logToWebhook({
            title: 'Command Execution Log',
            color: 0x57F287,
            fields: [
                {name: 'Command', value: `\`/${interaction.commandName}\``, inline: true},
                {name: 'User', value: `${interaction.user.username} (\`${interaction.user.id}\`)`, inline: true},
                {name: 'Location', value: interaction.guild ? interaction.guild.name : 'DM', inline: true},
            ]
        });
    }
});
client.on('error', (e) => console.error('Client error:', e));

async function start() {
    await registerCommands();
    if (settings.miscellaneous.activateFeatures){
        await registerFeatures();
    }
    await client.login(TOKEN);
}

start();