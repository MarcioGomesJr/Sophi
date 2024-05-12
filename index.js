const { getClient } = require('./src/util/clientManager');
const ServerPlayer = require('./src/domain/ServerPlayer');
const SophiError = require('./src/domain/SophiError');

const token = require('./src/token').token;
const allCommands = require('./src/commands/allCommands');

const sophi = getClient();

/**
 * @type {Map<string, ServerPlayer>}
 */
const serverPlayers = new Map();

sophi.on('ready', () => {
    sophi.user.setActivity('indie babe uwu', { type: 'LISTENING' });
    console.log(`Logged in as ${sophi.user.tag}!`);
});

sophi.on('messageCreate', async (message) => {
    if (message.author.bot || message.content[0] !== '-' || message.content.length < 2) {
        return;
    }

    if (!message.member) {
        return message.channel.send('Sinto muito, só funciono em servidores! ewe');
    }

    const normalizedMessage = normalizeMessage(message.content);

    for (let command of allCommands) {
        const [willExecute, argument] = command.shouldExecute(message, normalizedMessage);
        if (!willExecute) {
            continue;
        }

        if (command.requireInVoice && !message.member.voice?.channel) {
            message.reply('Você precisa estar conectado à uma sala de voz para fazer isto :s');
            break;
        }

        if (!serverPlayers.has(message.guildId)) {
            serverPlayers.set(message.guildId, new ServerPlayer());
            const owner = await message.guild.fetchOwner();
            console.log(
                `Novo servidor: '${message.guild.name}'(${message.guildId}), total: ${serverPlayers.size}` +
                    `, dono: '${owner.displayName}'(${owner.id})`
            );
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
    }
});

/**
 *
 * @param {string} messageText
 * @returns {string}
 */
function normalizeMessage(messageText) {
    const textWithoutPrefix = messageText.substring(1);
    const separator = /^(\S+)(\s+)?(.+)?$/g;

    const match = separator.exec(textWithoutPrefix);
    if (!match) {
        console.log('Mensagem não corresponde a nenhum comando ' + messageText);
        return '';
    }

    if (match[3] === undefined) {
        return match[1].toLowerCase();
    }

    return match[1].toLowerCase() + ' ' + match[3];
}

sophi.login(token);
