// Comando para pular para um index da playlist
const Command = require("../domain/Command");
const { messageStartsWithCommand } = require('../util/commandUtil');

const skip = new Command(
    (message, normalizedMessage) => {
        return messageStartsWithCommand(normalizedMessage, ['goto', 'go']);
    },

    async (message, argument, serverPlayer) => {
        const result = /^\s*(\d+|last|next)/g.exec(argument);
        if (!result) {
            return message.reply('Uso errado do comando! Deve ser -goto 3 por exemplo :v');
        }

        const index = resolveIndex(result[1], serverPlayer);

        try {
            serverPlayer.skipToSong(index);
        } catch (e) {
            return message.reply(e.message);
        }
    }
);

module.exports = skip;
