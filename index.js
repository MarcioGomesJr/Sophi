const { getClient } = require('./src/util/singletonManager');
const ServerPlayer = require('./src/domain/ServerPlayer');
const SophiError = require('./src/domain/SophiError');

const token = require('./src/token').token;
const allCommands = require('./src/commands/allCommands');

const sophi = getClient();

const serverPlayers = new Map();

sophi.on('ready', () => {
    sophi.user.setActivity('indie babe uwu', { type: 'LISTENING'});
    console.log(`Logged in as ${sophi.user.tag}!`);
});

sophi.on('messageCreate', async message => {
    if (message.author.id === sophi.user.id || message.content[0] !== '-') { 
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

        command.execute(message, argument, serverPlayer).catch(e => {
            if (e instanceof SophiError) {
                message.reply(e.message);
            }
            else {
                console.log(`Erro ao processar a mensagem: "${normalizedMessage}": ${e.message}`);
            }
        });
    });
});

sophi.login(token);
