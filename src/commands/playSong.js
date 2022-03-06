// Comando para adicionar músicas na playlist p adiciona como última e pn como a próxima
const radin = require('../player');
const play = require('play-dl');
const Command = require("../domain/Command");
const PlaylistEntry = require('../domain/PlaylistEntry');
const { messageStartsWithCommand } = require('../util/commandUtil');

const playSong = new Command(
    (message, normalizedMessage) => {
        const isNormalPlay = messageStartsWithCommand(normalizedMessage, ['play', 'p']);
        if (isNormalPlay[0]) {
            return isNormalPlay;
        }
        return messageStartsWithCommand(normalizedMessage, ['playnext', 'pn']);
    },

    async (message, argument, serverPlayer) => {
        const ytInfo = (await play.search(argument, { limit : 1 }))[0];

        if (!ytInfo) {
            return message.reply('Infelizmente sua pesquisa não foi encontrada ou não é um link de um vídeo no YouTube aa');
        }

        const playNext = /^\Spn/gi.exec(message.content);
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
