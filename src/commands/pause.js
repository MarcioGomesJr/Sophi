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
        if (!currentAudioPlayer) {
            message.channel.send('Não tem nada tocando ou pausado owo');
            return;
        }

        if (currentAudioPlayer.state.status === 'paused') {
            currentAudioPlayer.unpause();
            message.channel.send("It's dare U-U");
        }
        else if (currentAudioPlayer.state.status === 'playing') {
            currentAudioPlayer.pause();
            message.channel.send("PAUSO! O-o");
        }
        else {
            message.channel.send('Não tem nada tocando ou pausado uwu');
        }
    }
);

module.exports = pause;
