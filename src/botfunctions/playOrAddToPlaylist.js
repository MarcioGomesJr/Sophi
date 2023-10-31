const { Message } = require('discord.js');
const { YouTubeVideo } = require('play-dl');
const ServerPlayer = require('../domain/ServerPlayer');
const PlaylistEntry = require('../domain/PlaylistEntry');
const radin = require('../botfunctions/player');
const { playlistLimit: limit } = require('../botfunctions/searchTrack');

/**
 *
 * @param {Message} message
 * @param {ServerPlayer} serverPlayer
 * @param {YouTubeVideo[]} ytInfos
 * @param {boolean} asNext
 */
function playOrAddToPlaylist(message, serverPlayer, ytInfos, asNext = false) {
    const playlistHasEnded = serverPlayer.playlistHasEnded();
    const trimed = trimPlaylist(serverPlayer, ytInfos, limit, playlistHasEnded);

    if (trimed) {
        if (ytInfos.length === 0) {
            return message.reply(`A playlist já está cheia! O Tamanho máximo é de ${limit} @w@`);
        } else {
            message.reply(`A playlist está bem grande! Limitei seu pedido à ${ytInfos.length} musica(s) @w@`);
        }
    }

    if (ytInfos.length > 1) {
        message.reply(
            `Um total de (${ytInfos.length}) músicas foram adicionadas ${asNext ? 'como as próximas' : ''} na queue e.e`
        );
    } else if (!playlistHasEnded) {
        message.reply(`Sua música (${ytInfos[0].title}) foi adicionada ${asNext ? 'como a próxima' : ''} na queue e.e`);
    }


    ytInfos.forEach((ytInfo) => {
        if (ytInfo.durationInSec > 60 * 60) {
            return message.reply(`Aaaaaaaaaa o vídeo ${ytInfo.title} tem mais de uma hora! Muito loooongo uwu`);
        }

        const playlistEntry = new PlaylistEntry(message, ytInfo);

        serverPlayer.addToPlaylist(playlistEntry, asNext);
    });

    if (playlistHasEnded) {
        radin(serverPlayer);
    }

    console.log(`Adicionados ${ytInfos.length} itens à playlist`);
}

/**
 *
 * @param {ServerPlayer} serverPlayer
 * @param {YouTubeVideo[]} ytInfos
 * @param {number} limite
 * @param {boolean} playlistHasEnded
 * @returns {boolean}
 */
function trimPlaylist(serverPlayer, ytInfos, limite, playlistHasEnded) {
    const toBePlayed = serverPlayer.playlist.length - (serverPlayer.currentSongIndex + (playlistHasEnded ? 0 : 1));

    if (toBePlayed + ytInfos.length > limite) {
        const toAdd = Math.max(limite - toBePlayed, 0);
        ytInfos.splice(toAdd, ytInfos.length - toAdd);
        return true;
    }

    return false;
}

module.exports = playOrAddToPlaylist;
