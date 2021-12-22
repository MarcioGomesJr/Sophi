// Comando para manipular a playlist movendo elementos dela pelos indexes
const Command = require("../domain/Command");
const resolveIndex = require('../util/resolveIndex');

const skip = new Command(
    (message, normalizedMessage) => {
        if (normalizedMessage.startsWith('mv ')) {
            return [true, normalizedMessage.substring(3)];
        }
        return [false, ''];
    },

    async (message, argument, serverPlayer) => {
        const indexes = /^\s*(\d+|last|next) \s*(\d+|last|next)/g.exec(argument);

        if (!indexes) {
            return message.reply('Uso errado do comando! Deve ser -mv 3 2 por exemplo :v');
        }

        const from = resolveIndex(indexes[1], serverPlayer);
        const to = resolveIndex(indexes[2], serverPlayer);

        try {
            serverPlayer.move(from, to);
        } catch (e) {
            return message.reply(e.message);
        }

        message.channel.send('Músicas movidas uwu');
    }
);

module.exports = skip;
