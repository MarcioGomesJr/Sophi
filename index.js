const { getClient } = require('./src/util/clientManager');
const ServerPlayer = require('./src/domain/ServerPlayer');
const SophiError = require('./src/domain/SophiError');
const version = require('./package.json').version;
const logger = require('./src/util/logger');

const { token, prefix } = require('./src/token');
const allCommands = require('./src/commands/allCommands');

logger.info(`Starting up bot. Version: ${version}.`);

const sophi = getClient();

/**
 * @type {Map<string, ServerPlayer>}
 */
const serverPlayers = new Map();

sophi.on('ready', () => {
    sophi.user.setActivity('indie babe uwu', { type: 'LISTENING' });
    logger.info(`Logged in as ${sophi.user.tag}!`);
});

const commandPrefix = prefix ?? '-';

sophi.on('messageCreate', async (message) => {
    if (message.author.bot || message.content[0] !== commandPrefix || message.content.length < 2) {
        return;
    }

    if (!message.member) {
        message.channel.send('Sinto muito, só funciono em servidores! ewe');
        return;
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

        const guildId = message.guildId;

        if (!serverPlayers.has(guildId)) {
            serverPlayers.set(guildId, new ServerPlayer(guildId));
            const owner = await message.guild.fetchOwner();
            logger.info(
                `Novo servidor: '${message.guild.name}'(${guildId}), total: ${serverPlayers.size}.` +
                    ` Dono: '${owner.user.username}'(${owner.id})`
            );
        }

        const serverPlayer = serverPlayers.get(guildId);

        serverPlayer.mutex.runExclusive(async () => {
            const commandoUserServer =
                `'${normalizedMessage}' do usuário '${message.author.username}'(${message.author.id})` +
                ` no servidor '${message.guild.name}'(${guildId})`;
            try {
                logger.info(`Executando comando ${commandoUserServer}`);
                await command.execute(message, argument, serverPlayer);
            } catch (e) {
                if (e instanceof SophiError) {
                    message.reply(e.message);
                } else {
                    logger.error(`Erro ao processar a mensagem: "${commandoUserServer}`, e);
                }
            }
        });

        break;
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
        logger.info(`Mensagem não corresponde a nenhum comando ${messageText}`);
        return '';
    }

    if (match[3] === undefined) {
        return match[1].toLowerCase();
    }

    return match[1].toLowerCase() + ' ' + match[3];
}

sophi.login(token);
