const radin = require('../player');
const play  =  require('play-dl');
const Command = require("../domain/Command");
const PlaylistEntry = require('../domain/PlaylistEntry');

const playSong = new Command(
    (message, normalizedMessage) => {
        if (normalizedMessage.startsWith('p ')) {
            return [true, normalizedMessage.substring(2)];
        }
        return [false, ''];
    },

    async (message, argument, serverPlayer) => {
        const ytInfo = (await play.search(argument, { limit : 1 }))[0];

        if (!ytInfo) {
            return message.reply('Infelizmente sua pesquisa não foi encontrada ou não é um link de um vídeo no YouTube aa');
        }
        
        const playlist = serverPlayer.playlist;
        const playlistEntry = new PlaylistEntry(message, ytInfo);

        playlist.push(playlistEntry);

        if (playlist.length - 1 === serverPlayer.currentSongIndex) {
            radin(serverPlayer);
        }
        else {
            message.reply('Sua música (' + ytInfo.title +  ') foi adicionada na queue e.e');
        }
    }
);

module.exports = playSong;
