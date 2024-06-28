const { AudioPlayerStatus } = require('@discordjs/voice');
const Command = require('../domain/Command');
const { messageIsCommand } = require('../util/commandUtil');

const pause = new Command(
    (_message, normalizedMessage) => {
        return messageIsCommand(normalizedMessage, ['pause', 'play', 'p']);
    },

    async (message, _argument, serverPlayer) => {
        const audioPlayer = serverPlayer.audioPlayer;

        if (serverPlayer.notPlayingOrPaused()) {
            message.channel.send('Não tem nada tocando ou pausado owo');
        } else if (serverPlayer.playerStatus() === AudioPlayerStatus.Paused) {
            clearInterval(serverPlayer.pauseTimer);

            audioPlayer.unpause();
            message.channel.send('It`s dare U-U');
        } else if (serverPlayer.playerStatus() === AudioPlayerStatus.Playing) {
            audioPlayer.pause();
            message.channel.send('PAUSO! O-o');

            serverPlayer.pauseTimer = setTimeout(() => {
                message.channel.send('Fiquei muito tempo pausada, limpei a platylist uwu');
                serverPlayer.clearPlaylist();
                audioPlayer.stop();
            }, 60 * 60 * 1000); // One hour
        }
    }
);

module.exports = pause;
