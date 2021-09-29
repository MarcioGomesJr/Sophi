const Command = require("../domain/Command");

const skip = new Command(
    (message) => {
        if (message.content === '-s') {
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

        message.reply('Skiiiiiiiiiipooooo-desu vruuuuuuuuuuuuuuuuuuuuuuuuuuum!!!!');
        currentAudioPlayer.stop();
    }
);

module.exports = skip;
