// Comando para embaralhar o restante da playlist
const Command = require("../domain/Command");
const { messageIsCommand } = require('../util/commandUtil');

const shuffle = new Command(
    (message, normalizedMessage) => {
        return messageIsCommand(normalizedMessage, ['shuffle', 'random']);
    },

    async (message, argument, serverPlayer) => {
        serverPlayer.shufflePlaylist();
        message.channel.send('Tudo bem misturado 🌀');
    }
);

module.exports = shuffle;
