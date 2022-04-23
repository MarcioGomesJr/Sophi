const { Client } = require('discord.js');
const { Intents } = require('discord.js');

let client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.DIRECT_MESSAGES],
    partials : ['CHANNEL', 'MESSAGE'],
});

module.exports = {
    getClient() {
        return client;
    }
}
