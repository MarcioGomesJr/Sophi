// Comandos para adicionar músicas na playlist
const radin = require('../botfunctions/player');
const Command = require('../domain/Command');
const PlaylistEntry = require('../domain/PlaylistEntry');
const { messageStartsWithCommand } = require('../util/commandUtil');
const { resolveIndex, getIndexRegex } = require('../util/indexUtil');
const searchTrack = require('../botfunctions/searchTrack');
const { Message } = require('discord.js');
const playdl = require('play-dl');
const ServerPlayer = require('../domain/ServerPlayer');

/**
 * 
 * @param {Message} message
 * @param {ServerPlayer} serverPlayer
 * @param {playdl.YouTubeVideo[]} ytInfos
 * @param {boolean} asNext
 */
function playOrAddToPlaylist(message, serverPlayer, ytInfos, asNext = false) {
    const playlistHasEnded = serverPlayer.playlistHasEnded();

    if (ytInfos.length > 1) {
        message.reply(
            `Um total de (${ytInfos.length}) músicas foram adicionadas ${asNext ? 'como as próximas' : ''} na queue e.e`
        );
    } else if (!playlistHasEnded) {
        message.reply(`Sua música (${ytInfos[0].title}) foi adicionada ${asNext ? 'como a próxima' : ''} na queue e.e`);
    }

    ytInfos.forEach((ytInfo, index) => {
        const playlistEntry = new PlaylistEntry(message, ytInfo);

        serverPlayer.addToPlaylist(playlistEntry, asNext);

        if (playlistHasEnded && index == 0) {
            radin(serverPlayer);
        }
    });
}

const play = new Command(
    (message, normalizedMessage) => {
        return messageStartsWithCommand(normalizedMessage, ['play', 'p']);
    },

    async (message, argument, serverPlayer) => {
        const [ytInfos, error] = await searchTrack(argument);

        if (error) {
            return message.reply(error);
        }

        playOrAddToPlaylist(message, serverPlayer, ytInfos);
    }
);

const playNext = new Command(
    (message, normalizedMessage) => {
        return messageStartsWithCommand(normalizedMessage, ['playnext', 'pn']);
    },

    async (message, argument, serverPlayer) => {
        const [ytInfos, error] = await searchTrack(argument);

        if (error) {
            return message.reply(error);
        }

        playOrAddToPlaylist(message, serverPlayer, ytInfos, true);
    }
);

const playAgain = new Command(
    (message, normalizedMessage) => {
        return messageStartsWithCommand(normalizedMessage, ['playagain', 'pa']);
    },

    async (message, argument, serverPlayer) => {
        const result = getIndexRegex().exec(argument);
        if (!result) {
            return message.reply('Uso errado do comando! Deve ser -pa 3 por exemplo :v');
        }

        const index = resolveIndex(result[1], serverPlayer);
        serverPlayer.checkValidIndex(index);
        const playlistEntry = serverPlayer.playlist[index];

        playOrAddToPlaylist(message, serverPlayer, [playlistEntry.ytInfo]);
    }
);

module.exports = [play, playNext, playAgain];
