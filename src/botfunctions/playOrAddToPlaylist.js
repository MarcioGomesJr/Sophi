const { Message } = require('discord.js');
const { YouTubeVideo } = require('play-dl');
const ServerPlayer = require('../domain/ServerPlayer');
const PlaylistEntry = require('../domain/PlaylistEntry');
const radin = require('../botfunctions/player');

/**
 *
 * @param {Message} message
 * @param {ServerPlayer} serverPlayer
 * @param {YouTubeVideo[]} ytInfos
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

    let skipedFirst = false;

    ytInfos.forEach((ytInfo, index) => {
        if (ytInfo.durationInSec > 60 * 60) {
            if (index === 0 || skipedFirst) {
                skipedFirst = true;
            }
            return message.reply(`Aaaaaaaaaa o vídeo ${ytInfo.title} tem mais de uma hora! Muito loooongo uwu`);
        }

        const playlistEntry = new PlaylistEntry(message, ytInfo);

        serverPlayer.addToPlaylist(playlistEntry, asNext);

        if (playlistHasEnded && (index === 0 || skipedFirst)) {
            radin(serverPlayer);
            skipedFirst = false;
        }
    });
}

module.exports = playOrAddToPlaylist;
