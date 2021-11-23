const Command = require("../domain/Command");
const skip = new Command(
    (message, normalizedMessage) => {
        if (normalizedMessage === 's') {
            return [true, ''];
        }
        return [false, ''];
    },

    async (message, argument, serverPlayer) => {
        const currentAudioPlayer = serverPlayer.currentAudioPlayer;

        if (!currentAudioPlayer || serverPlayer.playlistHasEnded()) {
            return message.channel.send('Não tem nada tocando ou pausado uwu');
        }

        serverPlayer.skipToSong();

        message.channel.send('Skiiiiiiiiiipooooo-desu vruuuuuuuuuuuuuuuuuuuuuuuuuuum!!!!');
    }
);

module.exports = skip;
