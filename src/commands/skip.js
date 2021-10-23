const Command = require("../domain/Command");
const radin = require('../player');
const playSong = require("./playSong");

const skip = new Command(
    (message, normalizedMessage) => {
        if (normalizedMessage === 's') {
            return [true, ''];
        }
        return [false, ''];
    },

    async (message, argument, serverPlayer) => {
        const currentAudioPlayer = serverPlayer.currentAudioPlayer;
        const playlist = serverPlayer.playlist;

        if (!currentAudioPlayer || serverPlayer.playlistHasEnded()) {
            message.channel.send('Não tem nada tocando ou pausado uwu');
            return;
        }

        serverPlayer.getCurrentEntry().stopRadin = true;
        serverPlayer.currentSongIndex++;
        currentAudioPlayer.stop();

        if (!serverPlayer.playlistHasEnded()) {
            radin(serverPlayer);
        }

        message.channel.send('Skiiiiiiiiiipooooo-desu vruuuuuuuuuuuuuuuuuuuuuuuuuuum!!!!');
    }
);

module.exports = skip;
