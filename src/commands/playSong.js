// Comando para adicionar músicas na playlist p adiciona como última e pn como a próxima
const radin = require('../player');
const play  =  require('play-dl');
const Command = require("../domain/Command");
const PlaylistEntry = require('../domain/PlaylistEntry');

const playNextRegex = new RegExp('^.+pn ', 'ig');

const playSong = new Command(
    (message, normalizedMessage) => {
        if (normalizedMessage.startsWith('p ')) {
            return [true, normalizedMessage.substring(2)];
        }
        else if (normalizedMessage.startsWith('pn ')) {
            return [true, normalizedMessage.substring(3)];
        }
        return [false, ''];
    },

    async (message, argument, serverPlayer) => {
        const ytInfo = (await play.search(argument, { limit : 1 }))[0];

        if (!ytInfo) {
            return message.reply('Infelizmente sua pesquisa não foi encontrada ou não é um link de um vídeo no YouTube aa');
        }

        const playNext = message.content.match(playNextRegex);
        const playlistHasEnded = serverPlayer.playlistHasEnded();
        const playlistEntry = new PlaylistEntry(message, ytInfo);

        if (playNext) {
            serverPlayer.addToPlaylistNext(playlistEntry);
        }
        else {
            serverPlayer.addToPlaylist(playlistEntry);
        }

        if (playlistHasEnded) {
            radin(serverPlayer);
        }
        else {
            message.reply(`Sua música (${ytInfo.title}) foi adicionada ${playNext ? 'como a próxima' : ''} na queue e.e`);
        }
    }
);

module.exports = playSong;
