const Command = require("../domain/Command");

const pause = new Command(
    (message) => {
        if (message.content === '-p') {
            return [true, ''];
        }
        return [false, ''];
    },

    async (message, argument, serverPlayer) => {
        const currentAudioPlayer = serverPlayer.currentAudioPlayer;
        if (!currentAudioPlayer) {
            message.reply('Não tem nada tocando ou pausado uwu');
            return;
        }

        if (currentAudioPlayer.state.status === 'paused') {
            currentAudioPlayer.unpause();
            message.reply("It's dare U-U");
        }
        else if (currentAudioPlayer.state.status === 'playing') {
            currentAudioPlayer.pause();
            message.reply("PAUSO! O-o");
        }
        else {
            message.reply('Não tem nada tocando ou pausado uwu');
        }
    }
);

module.exports = pause;
