// Comando para manipular a playlist movendo elementos dela pelos indexes
const Command = require("../domain/Command");
const resolveIndex = require('../util/resolveIndex');
const { messageStartsWithCommand } = require('../util/commandUtil');

const skip = new Command(
    (message, normalizedMessage) => {
        return messageStartsWithCommand(normalizedMessage, ['move', 'mv']);
    },

    async (message, argument, serverPlayer) => {
        const indexes = /^(\d+|last|next) \s*(\d+|last|next)$/g.exec(argument);

        if (!indexes) {
            return message.reply('Uso errado do comando! Deve ser -mv 3 2 por exemplo :v');
        }

        const from = resolveIndex(indexes[1], serverPlayer);
        const to = resolveIndex(indexes[2], serverPlayer);

        serverPlayer.move(from, to);
        message.channel.send('Músicas movidas uwu');
    }
);

module.exports = skip;
