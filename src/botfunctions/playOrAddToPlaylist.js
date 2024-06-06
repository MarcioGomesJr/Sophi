const { Message } = require('discord.js');
const { YouTubeVideo } = require('play-dl');
const ServerPlayer = require('../domain/ServerPlayer');
const PlaylistEntry = require('../domain/PlaylistEntry');
const radin = require('../botfunctions/player');
const { playlistLimit: limit } = require('../botfunctions/searchTrack');
const logger = require('../util/logger');
const { formatDuration } = require('../util/formatUtil');

/**
 *
 * @param {Message} message
 * @param {ServerPlayer} serverPlayer
 * @param {YouTubeVideo[]} ytInfos
 * @param {boolean} asNext
 * @returns {Promise<any>}
 */
async function playOrAddToPlaylist(message, serverPlayer, ytInfos, asNext = false) {
    ytInfos = ytInfos.filter((ytInfo) => {
        // 2 hours
        if (ytInfo.durationInSec > 7200) {
            message.reply(`O vídeo ${ytInfo.title} tem mais de duas horas! Muito longo uwu`);
            return false;
        }
        return true;
    });
    if (filteredInfos.length === 0) {
        return;
    }

    const trimed = trimPlaylist(serverPlayer, filteredInfos, limit);

    if (trimed) {
        message.reply(
            filteredInfos.length === 0
                ? `A playlist já está cheia! O tamanho máximo é de ${limit} @w@`
                : `A playlist está bem grande! Limitei seu pedido a ${filteredInfos.length} música(s) @w@`
        );
        if (filteredInfos.length === 0) {
            return;
        }
    }

    if (filteredInfos.length > 1) {
        message.reply(
            `Um total de ${filteredInfos.length} músicas foram adicionadas ${
                asNext ? 'como as próximas' : ''
            } na fila e.e`
        );
    } else if (!serverPlayer.playlistHasEnded()) {
        message.reply(
            `Sua música '${filteredInfos[0].title}' (${filteredInfos[0].durationRaw}) foi adicionada ${
                asNext ? 'como a próxima' : ''
            } na fila e.e`
        );
    }

    let totalMinutes = 0;
    filteredInfos.forEach((ytInfo) => {
        totalMinutes += ytInfo.durationInSec;

        const playlistEntry = new PlaylistEntry(message, ytInfo);
        serverPlayer.addToPlaylist(playlistEntry, asNext);
    });

    logger.info(`Adicionados ${filteredInfos.length} itens à playlist. Tempo: ${formatDuration(totalMinutes)}`);

    if (serverPlayer.playlistHasEnded()) {
        await radin(serverPlayer);
    }
}

/**
 *
 * @param {ServerPlayer} serverPlayer
 * @param {YouTubeVideo[]} ytInfos
 * @param {number} limit
 * @returns {boolean}
 */
function trimPlaylist(serverPlayer, ytInfos, limit) {
    const toBePlayed = serverPlayer.toBePlayed();

    if (toBePlayed + ytInfos.length > limit) {
        const toAdd = Math.max(limit - toBePlayed, 0);
        ytInfos.splice(toAdd, ytInfos.length - toAdd);
        return true;
    }

    return false;
}

module.exports = playOrAddToPlaylist;
