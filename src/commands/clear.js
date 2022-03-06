// Comando para limpar a playlist
const Command = require("../domain/Command");
const { messageIsCommand } = require('../util/commandUtil');

const skip = new Command(
    (message, normalizedMessage) => {
        return messageIsCommand(normalizedMessage, ['clear', 'c']);
    },

    async (message, argument, serverPlayer) => {
        serverPlayer.clearPlaylist();
        message.channel.send('TA LIMPO 😠');
    }
);

module.exports = skip;
