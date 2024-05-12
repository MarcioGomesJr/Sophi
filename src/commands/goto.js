// Comando para pular para um index da playlist
const radin = require("../botfunctions/player");
const Command = require("../domain/Command");
const { messageStartsWithCommand } = require('../util/commandUtil');
const { resolveIndex, getIndexRegex } = require("../util/indexUtil");

const skip = new Command(
    (message, normalizedMessage) => {
        return messageStartsWithCommand(normalizedMessage, ['goto', 'go']);
    },

    async (message, argument, serverPlayer) => {
        const result = getIndexRegex().exec(argument);
        if (!result) {
            return message.reply('Uso errado do comando! Deve ser -goto 3 por exemplo :v');
        }

        const index = resolveIndex(result[1], serverPlayer);

        if (serverPlayer.skipToSong(index)) {
            radin(serverPlayer);
        }
    }
);

module.exports = skip;
