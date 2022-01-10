// Comando para limpar a playlist
const Command = require("../domain/Command");

const skip = new Command(
    (message, normalizedMessage) => {
        if (normalizedMessage === 'clear') {
            return [true, ''];
        }
        return [false, ''];
    },

    async (message, argument, serverPlayer) => {
        serverPlayer.clearPlaylist();
        message.channel.send('TA LIMPO 😠');
    }
);

module.exports = skip;
