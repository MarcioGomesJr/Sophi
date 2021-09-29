const Command = require("../domain/Command");

const skip = new Command(
    (message) => {
        if (message.content === '-s') {
            return [true, ''];
        }
        return [false, ''];
    },

    async (message, argument, playlists, currentAudioPlayer) => {
        message.reply('Skiiiiiiiiiipooooo-desu vruuuuuuuuuuuuuuuuuuuuuuuuuuum!!!!');
        currentAudioPlayer['1'].stop();
    }
);

module.exports = skip;
