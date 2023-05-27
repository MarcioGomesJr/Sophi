const { AudioPlayerStatus } = require("@discordjs/voice");
const Command = require("../domain/Command");
const { messageIsCommand } = require('../util/commandUtil');

const pause = new Command(
    (message, normalizedMessage) => {
        return messageIsCommand(normalizedMessage, ['pause', 'play', 'p']);
    },

    async (message, argument, serverPlayer) => {
        const audioPlayer = serverPlayer.audioPlayer;

        if (serverPlayer.notPlayingOrPaused()) {
            message.channel.send('Não tem nada tocando ou pausado owo');
        } else if (serverPlayer.playerStatus() === AudioPlayerStatus.Paused) {
            clearInterval(serverPlayer.pauseTimer);

            audioPlayer.unpause();
            message.channel.send("It's dare U-U");
        } else if (serverPlayer.playerStatus() === AudioPlayerStatus.Playing) {
            audioPlayer.pause();
            message.channel.send("PAUSO! O-o");

            serverPlayer.pauseTimer = setTimeout(() => {
                serverPlayer.clearPlaylist();
                audioPlayer.stop();
            }, 30 * 60 * 1000);
        }
    }
);

module.exports = pause;
