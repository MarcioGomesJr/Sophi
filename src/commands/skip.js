const Command = require("../domain/Command");

const skip = new Command(
    (message) => {
        if (message.content === '-s') {
            return [true, ''];
        }
        return [false, ''];
    },

    async (message, argument, serverPlayer) => {
        message.channel.send('Skiiiiiiiiiipooooo-desu vruuuuuuuuuuuuuuuuuuuuuuuuuuum!!!!');
        serverPlayer.currentAudioPlayer.stop();
    }
);

module.exports = skip;
