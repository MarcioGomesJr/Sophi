const radin = require('../player');
const Command = require("../domain/Command");

const playSong = new Command(
    (message) => {
        if (message.content.startsWith('-p ')) {
            return [true, message.content.substring(3)];
        }
        return [false, ''];
    },

    async (message, argument, playlists, currentAudioPlayer) => {
        playlists.push(message);

        if (playlists.length === 1) {
            radin(playlists, currentAudioPlayer);
        }
        else {
            message.reply('Sua música foi adicionada na queue e.e');
        }
    }
);

module.exports = playSong;
