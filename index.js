const Sophi = require('discord.js');
const { Intents } = require('discord.js');
const ServerPlayer = require('./src/domain/ServerPlayer');
const token  = require('./src/token').token;

const skip = require('./src/commands/skip');
const pause = require('./src/commands/pause');
const playSong = require('./src/commands/playSong');
const queue = require('./src/commands/queue');
const move = require('./src/commands/move');
const remove = require('./src/commands/remove');
const clear = require('./src/commands/clear');
const goto = require('./src/commands/goto');

const client = new Sophi.Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.DIRECT_MESSAGES],
    partials : ['CHANNEL', 'MESSAGE'],
});

const serverPlayers = new Map();

const allCommands = [pause, playSong, skip, queue, move, remove, clear, goto];

client.on('ready', () => {
    client.user.setActivity('indie babe uwu', { type: 'LISTENING'});
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
    if (message.author.id === client.user.id || message.content[0] !== '-') { 
        return;
    }
    
    if (!message.member) {
        return message.channel.send('Sinto muito, só funciono em servidores! ewe');
    }

    const normalizedMessage = message.content.substring(1).toLowerCase();

    allCommands.forEach((command) => {
        const [willExecute, argument] = command.shouldExecute(message, normalizedMessage);
        if (!willExecute) {
            return;
        }

        if (command.requireInVoice && !message.member.voice?.channel) {
            return message.reply('Você precisa estar conectado à uma sala de voz para fazer isto :s');
        }

        if (!serverPlayers.get(message.guildId)) {
            serverPlayers.set(message.guildId, new ServerPlayer());
        }

        const serverPlayer = serverPlayers.get(message.guildId);

        try {
            command.execute(message, argument, serverPlayer);
        } catch (e) {
            console.log(`Erro ao processar a mensagem: "${normalizedMessage}":\n${e.message}`);
        }
    });
});

client.login(token);
