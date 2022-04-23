// Comandos para adicionar músicas na playlist
const playdl = require('play-dl');
const radin = require('../player');
const Command = require("../domain/Command");
const PlaylistEntry = require('../domain/PlaylistEntry');
const { messageStartsWithCommand } = require('../util/commandUtil');
const resolveIndex = require('../util/resolveIndex');

// TODO tratar erro ao tentar tocar música com restrição de idade aqui para simplificar um pouco o player,
// implementar tocar playlists do youtube, limitar durtação dos vídeos e no futuro implementar busca em
// outros serviços de vídeos/áudio.
async function searchYoutube(searchTerm) {
    if (searchTerm.startsWith('https') && playdl.yt_validate(searchTerm) !== 'video') {
        return [null, 'Infelizmente só consigo reproduzir links de vídeos do YouTube a'];
    }

    const [ytInfo] = await playdl.search(encodeURIComponent(searchTerm), { source: { youtube: 'video' }, limit : 1 });

    if (!ytInfo) {
        return [null, 'Infelizmente sua pesquisa não foi encontrada ou não é um link de um vídeo no YouTube aa'];
    }

    return [ytInfo, null];
}

function playOrAddToPlaylist(message, serverPlayer, ytInfo, asNext = false) {
    const playlistHasEnded = serverPlayer.playlistHasEnded();
    const playlistEntry = new PlaylistEntry(message, ytInfo);

    serverPlayer.addToPlaylist(playlistEntry, asNext);

    if (playlistHasEnded) {
        radin(serverPlayer);
    }
    else {
        message.reply(`Sua música (${ytInfo.title}) foi adicionada ${asNext ? 'como a próxima' : ''} na queue e.e`);
    }
}

const play = new Command(
    (message, normalizedMessage) => {
        return messageStartsWithCommand(normalizedMessage, ['play', 'p']);
    },

    async (message, argument, serverPlayer) => {
        const [ytInfo, error] = await searchYoutube(argument);

        if (error) {
            return message.reply(error);
        }

        playOrAddToPlaylist(message, serverPlayer, ytInfo);
    }
);

const playNext = new Command(
    (message, normalizedMessage) => {
        return messageStartsWithCommand(normalizedMessage, ['playnext', 'pn']);
    },

    async (message, argument, serverPlayer) => {
        const [ytInfo, error] = await searchYoutube(argument);

        if (error) {
            return message.reply(error);
        }

        playOrAddToPlaylist(message, serverPlayer, ytInfo, true);
    }
);

const playAgain = new Command(
    (message, normalizedMessage) => {
        return messageStartsWithCommand(normalizedMessage, ['playagain', 'pa']);
    },

    async (message, argument, serverPlayer) => {
        const result = /^(\d+|last|next)$/g.exec(argument);
        if (!result) {
            return message.reply('Uso errado do comando! Deve ser -pa 3 por exemplo :v');
        }

        const index = resolveIndex(result[1], serverPlayer);
        const playlistEntry = serverPlayer.playlist[index];

        if (!playlistEntry) {
            return message.reply('Esse índice não é uma música válida! Use o -q para ver a playlist :v');
        }

        playOrAddToPlaylist(message, serverPlayer, playlistEntry.ytInfo);
    }
);

module.exports = [play, playNext, playAgain];
