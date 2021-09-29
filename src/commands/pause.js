const Command = require("../domain/Command");

const pause = new Command(
    (message) => {
        if (message.content === '-p') {
            return [true, ''];
        }
        return [false, ''];
    },

    async (message, argument, playlists, currentAudioPlayer) => {
        if (currentAudioPlayer['1'].state.status === 'paused') {
            currentAudioPlayer['1'].unpause();
            message.reply("It's dare U-U");
        }
        else {
            currentAudioPlayer['1'].pause();
            message.reply("PAUSO! O-o");
        }
    }
);


module.exports = pause;
