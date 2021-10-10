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

        if (serverPlayer.currentSongIndex + 1 < playlist.length) {
            serverPlayer.getCurrentEntry().stopRadin = true;
            serverPlayer.currentSongIndex++;
    
            radin(serverPlayer);
        }   

        message.channel.send('Skiiiiiiiiiipooooo-desu vruuuuuuuuuuuuuuuuuuuuuuuuuuum!!!!');
        currentAudioPlayer.stop();
    }
);

module.exports = skip;
