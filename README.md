#  DevBot - Modular Discord Bot Engine

[![Discord.js](https://img.shields.io/badge/discord.js-v14.24.2-blue.svg?logo=discord&logoColor=white)](https://discord.js.org)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-green.svg?logo=node.js&logoColor=white)](https://nodejs.org)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg?logo=docker&logoColor=white)](./Dockerfile)

DevBot is a modular, lightweight, and extensible Discord bot engine designed for developers. It features a clean architecture for adding slash commands and independent features, complete with built-in logging and configuration management.

---

## ✨ Features

- **🚀 Modular Architecture**: Add new commands in `commands/` and standalone features in `features/`.
- **📂 Auto-Loading**: Commands and features are automatically detected and registered.
- **📢 Webhook Logging**: Integrated system for logging bot events to a dedicated Discord channel.
- **🎨 Custom Presence**: Dynamic status and activity configuration via environment variables.
- **🐳 Docker Ready**: Optimized Docker Compose setup for easy deployment.

---

## 🛠️ Getting Started

### Prerequisites

- [Node.js 20+](https://nodejs.org/)
- npm or yarn
- A Discord Bot Token (get it from the [Discord Developer Portal](https://discord.com/developers/applications))

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/devbot.git
   cd devbot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure the environment:**
   Create a `.env` file in the root directory (or copy from a template):
   ```bash
   cp .env.example .env
   ```
   Fill in your `DISCORD_TOKEN` and `DISCORD_CLIENT_ID`.

4. **Run the bot:**
   ```bash
   npm start
   ```

---

## ⚙️ Configuration

The bot is configured entirely through environment variables.

| Variable                 | Description                                                                            | Default         |
|--------------------------|----------------------------------------------------------------------------------------|-----------------|
| `DISCORD_TOKEN`          | Your Discord Bot Token                                                                 | *Required*      |
| `DISCORD_CLIENT_ID`      | Your Bot's Application/Client ID                                                       | *Required*      |
| `PRESENCE_ENABLE`        | Enable/Disable custom presence                                                         | `true`          |
| `PRESENCE_STATUS`        | Bot status (`online`, `idle`, `dnd`, `invisible`)                                      | `online`        |
| `PRESENCE_ACTIVITY`      | Activity type (`Playing`, `Streaming`, `Listening`, `Watching`, `Competing`, `Custom`) | `Custom`        |
| `PRESENCE_NAME`          | The text to display in the activity                                                    | `Released v...` |
| `PRESENCE_STREAMING_URL` | Twitch/YouTube link (if activity is `Streaming`)                                       |                 |
| `WEBHOOK_ENABLE`         | Enable/Disable Webhook logging                                                         | `false`         |
| `WEBHOOK_URL`            | Discord Webhook URL for logs                                                           |                 |
| `FEATURES_ENABLE`        | Globally enable/disable modular features                                               | `false`         |
| `SHOW_WELCOME`           | Show splash message on startup                                                         | `false`         |

### Feature Specific Configs

#### Join-To-Create (JTC)
| Variable          | Description                                          |
|-------------------|------------------------------------------------------|
| `JTC_ENABLE`      | Enable Join-To-Create feature                        |
| `JTC_HUB_ID`      | Voice channel ID that users join to create a new one |
| `JTC_CATEGORY_ID` | Category ID where new voice channels will be created |

---

## 🏗️ Modularity

### Adding Commands
Add a new `.js` file to the `commands/` directory. It should export an object with `data` (SlashCommandBuilder) and `execute` (function):

```javascript
export const data = {
    name: 'hello',
    description: 'Says hi!',
};

export async function execute(interaction) {
    await interaction.reply('Hello there!');
}
```

### Adding Features
Add a new `.js` file to the `features/` directory. Features are functions that receive the `client` object upon initialization:

```javascript
export default function (client) {
    client.on('messageCreate', (message) => {
        // Your logic here
    });
};
```

---

## 📜 Default example Commands

- **Encryption/Encoding**: `base32`, `base58`, `base64`, `hex`, `url`
- **Utilities**: `qrcode`, `sha256`, `ping`, `speed`
- **Media**: `gif`

---

## 🐳 Docker Deployment

Deploying with Docker is simple:

```bash
# Build and start the container
docker-compose up -d
```

Your `.env` file will be automatically loaded into the container.

---

## 📜 License

This project uses a **custom license**.

- You may use, modify, and distribute this project for **private and internal commercial use** without asking for permission.
- **Claiming this project as your own original work is strictly prohibited.**
- Proper credit to the original author (**0xmrcl**) must be retained in all distributions and derivative works.

See the [`LICENSE`](./LICENSE) file for full terms.

---
## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to help improve DevBot.

Created by [0xmrcl](https://github.com/zeroXmrcl)
