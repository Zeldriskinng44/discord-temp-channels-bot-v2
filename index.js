const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();
const dotenv = require('dotenv');
dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers, 
  ],
  partials: [Partials.Channel, Partials.GuildMember],
});

client.db = db;
client.config = require('./config/config.js');

const localesPath = path.join(__dirname, 'locales');
const localeFiles = fs.readdirSync(localesPath).filter(file => file.endsWith('.json'));

client.locale = new Map();
for (const file of localeFiles) {
  const filePath = path.join(localesPath, file);
  const localeData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const localeName = path.basename(file, '.json');
  client.locale.set(localeName, localeData);
}

console.log('✅ Loaded localization files.');

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  try {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.execute) {
      client.on(event.name, (...args) => event.execute(client, ...args));
    }
    console.log(`✅ Loaded event: ${event.name}`);
  } catch (error) {
    console.error(`❌ Error loading event ${file}:`, error);
  }
}

client.once('ready', () => {
  console.clear();
  const line = '─'.repeat(50);
  console.log(line);
  console.log(`🌐 ${client.user.tag} is now online!`);
  console.log(line);
  console.log(`🤖 Bot Username  : ${client.user.username}`);
  console.log(`🆔 Bot ID        : ${client.user.id}`);
  console.log(`📅 Launched On   : ${new Date().toLocaleString()}`);
  console.log(line);
  console.log(`📊 Connected to  : ${client.guilds.cache.size} servers`);
  console.log(`👥 Total Users   : ${client.users.cache.size}`);
  console.log(`📁 Loaded Events : ${eventFiles.length}`);
  console.log(line);
  console.log(`© 2024 wickstudio - All Rights Reserved.`);
  console.log(`🔗 GitHub: https://github.com/wickstudio`);
  console.log(`🌐 YouTube: https://www.youtube.com/@wick_studio`);
  console.log(`💬 Discord: https://discord.gg/wicks`);
  console.log(line);
  console.log('✅ Bot is fully operational and ready to serve!');
  console.log(line);
});

process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', error => {
  console.error('Uncaught exception:', error);
});

client.login(client.config.discordToken);

client.on('error', console.error);
client.on('warn', console.warn);