const Command = require("../domain/Command");

const pause = new Command(
    (message, normalizedMessage) => {
        if (normalizedMessage === 'p') {
            return [true, ''];
        }
        return [false, ''];
    },

    async (message, argument, serverPlayer) => {
        const currentAudioPlayer = serverPlayer.currentAudioPlayer;
        if (serverPlayer.notPlayingOrPaused()) {
            message.channel.send('Não tem nada tocando ou pausado owo');
        }
        else if (serverPlayer.playerStatus() === 'paused') {
            currentAudioPlayer.unpause();
            message.channel.send("It's dare U-U");
        }
        else if (serverPlayer.playerStatus() === 'playing') {
            currentAudioPlayer.pause();
            message.channel.send("PAUSO! O-o");
        }
    }
);

module.exports = pause;
