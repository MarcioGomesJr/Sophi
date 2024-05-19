// Comando para manipular a playlist movendo elementos dela pelos indexes
const Command = require('../domain/Command');
const { resolveIndex, getTwoIndexesRegex } = require('../util/indexUtil');
const { messageStartsWithCommand } = require('../util/commandUtil');

const move = new Command(
    (_message, normalizedMessage) => {
        return messageStartsWithCommand(normalizedMessage, ['move', 'mv']);
    },

    async (message, argument, serverPlayer) => {
        const indexes = getTwoIndexesRegex().exec(argument);

        if (!indexes) {
            message.reply('Uso errado do comando! Deve ser -mv 3 2 por exemplo :v');
            return;
        }

        const from = resolveIndex(indexes[1], serverPlayer);
        const to = resolveIndex(indexes[2], serverPlayer);

        const playlist = serverPlayer.playlist;

        serverPlayer.move(from, to);
        message.channel.send(`Música "${playlist[to].ytInfo.title}" trocada com "${playlist[from].ytInfo.title}" uwu`);
    }
);

module.exports = move;
