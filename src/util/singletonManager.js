const { Client } = require('discord.js');
const { GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
    ],
    partials : ['CHANNEL', 'MESSAGE'],
});

module.exports = {
    getClient() {
        return client;
    }
}
