const Command = require("../domain/Command");
const { messageIsCommand } = require('../util/commandUtil');

const skip = new Command(
    (message, normalizedMessage) => {
        return messageIsCommand(normalizedMessage, ['skip', 's']);
    },

    async (message, argument, serverPlayer) => {
        if (serverPlayer.playlistHasEnded()) {
            return message.channel.send('Não tem nada tocando ou pausado uwu');
        }

        serverPlayer.skipToSong();

        message.channel.send('Skiiiiiiiiiipooooo-desu vruuuuuuuuuuuuuuuuuuuuuuuuuuum!!!!');
    }
);

module.exports = skip;
