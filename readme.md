# Discord Voice Channel Manager Bot

A powerful, multilingual Discord bot built with `discord.js` to manage temporary voice and text channels. The bot provides advanced permissions and customizable settings to enhance the server experience. Users can create, manage, and control their voice channels with ease.

## Features

- Automatic voice channel creation upon joining a specified channel
- Temporary text channel creation for each voice channel
- User-selectable options for managing channels, including:
  - Rename, Lock, Unlock, Set User Limit
  - Hide, Unhide, Delete
  - Transfer Ownership, Add and Remove Members
  - Blacklist Members
- Localized messages for a seamless user experience
- Support for multiple languages (default: Arabic)
- Persistent storage using `quick.db` and SQLite
- Custom permissions for users and bot

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/wickstudio/discord-temp-channels-bot-v2.git
   cd discord-temp-channels-bot-v2
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the project root and add your Discord bot token:
     ```dotenv
     DISCORD_TOKEN=your_bot_token_here
     ```

4. Configure the bot settings in `config/config.js`:
   - Set `joinVoiceChannelId` to the ID of the voice channel for joining
   - Set `categoryId` for the category under which temporary channels will be created

5. Run the bot:
   ```bash
   node index.js
   ```

## Configuration

### `config/config.js`

| Key                  | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| `joinVoiceChannelId` | Voice channel ID to trigger bot's actions upon user joining                |
| `categoryId`         | ID of the category for creating temporary channels                         |
| `botPermissions`     | Array of permissions for bot operations                                    |
| `userPermissions`    | Array of permissions for users in temporary channels                       |
| `language`           | Language for localization (e.g., 'ar' for Arabic)                          |

### Localization

Add localization files in `locales/` directory (e.g., `en.json`, `ar.json`), each containing key-value pairs for translated messages.

## Usage

- Join the configured voice channel to create a temporary channel.
- Manage channels via button interactions in the text channel.
- The bot will delete channels when no members are present, keeping your server tidy.

### Available Commands and Interactions

- **Hide / Unhide** - Controls visibility of the voice channel
- **Rename** - Allows renaming of the voice channel
- **Lock / Unlock** - Manages connection permissions
- **Set User Limit** - Sets a maximum user limit for the channel
- **Add / Remove Member** - Adds or removes a member's access to the channel
- **Blacklist** - Restricts access for specific users
- **Transfer Ownership** - Transfers channel ownership to another member
- **Delete** - Deletes both voice and text channels

## Example

Upon joining the specified voice channel, the bot will create a temporary voice and text channel for you. Use the buttons in the text channel to manage the temporary channel.

### Customization

Edit `locales` files and `config.js` to suit your server's requirements. Update permissions or adjust the default language as needed.

## Issues and Contributions

Please report issues on the GitHub repository. Contributions are welcome!

## Support

- GitHub: [wickstudio](https://github.com/wickstudio)
- YouTube: [@wick_studio](https://www.youtube.com/@wick_studio)
- Discord: [discord.gg/wicks](https://discord.gg/wicks)
- Email: [wick@wick-studio.com](mailto:wick@wick-studio.com)

---

**Discord Bot by [wickstudio](https://github.com/wickstudio)**