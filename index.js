const { getClient } = require('./src/util/clientManager');
const ServerPlayer = require('./src/domain/ServerPlayer');
const SophiError = require('./src/domain/SophiError');

const token = require('./src/token').token;
const allCommands = require('./src/commands/allCommands');

const sophi = getClient();

const serverPlayers = new Map();

sophi.on('ready', () => {
    sophi.user.setActivity('indie babe uwu', { type: 'LISTENING' });
    console.log(`Logged in as ${sophi.user.tag}!`);
});

sophi.on('messageCreate', async (message) => {
    if (message.author.bot || message.content[0] !== '?') {
        return;
    }

    if (!message.member) {
        return message.channel.send('Sinto muito, só funciono em servidores! ewe');
    }

    const normalizedMessage = normalizeMessage(message.content);

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

        serverPlayer.mutex.runExclusive(async () => {
            try {
                await command.execute(message, argument, serverPlayer);
            } catch (e) {
                if (e instanceof SophiError) {
                    message.reply(e.message);
                } else {
                    console.log(`Erro ao processar a mensagem: "${normalizedMessage}": ${e}\n${e.stack}`);
                }
            }
        });
    });
});

function normalizeMessage(messageText) {
    const textWithoutPrefix = messageText.substring(1);
    const separator = /^(\S+)(\s+)?(.+)?$/g;

    const match = separator.exec(textWithoutPrefix);

    if (match[3] === undefined) {
        return match[1].toLowerCase();
    }

    return match[1].toLowerCase() + ' ' + match[3];
}

sophi.login(token);
