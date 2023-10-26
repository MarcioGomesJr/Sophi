const play = require('play-dl');
const { joinVoiceChannel, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const ServerPlayer = require('../domain/ServerPlayer');
const PlaylistEntry = require('../domain/PlaylistEntry');

/**
 *
 * @param {ServerPlayer} serverPlayer
 * @param {boolean} sendMessage
 * @returns {Promise<void>}
 */
async function radin(serverPlayer, sendMessage = true) {
    const playlistEntry = serverPlayer.getCurrentEntry();
    if (!playlistEntry) {
        console.log(
            `Um objeto de PlaylistEntry era esperado! playlist ${serverPlayer.playlist.length} index: ${serverPlayer.currentSongIndex}`
        );
        return;
    }

    const sucesso = await playReq(serverPlayer, playlistEntry, sendMessage);
    clearTimeout(serverPlayer.idleTimer);

    if (!sucesso) {
        goToNextSong(serverPlayer);
        return;
    }

    const timeOutCheckPlaying = setInterval(() => {
        if (serverPlayer.notPlayingOrPaused()) {
            serverPlayer.skipToSong(serverPlayer.currentSongIndex, false);
        }
    }, 5000); // 5 seconds

    serverPlayer.audioPlayer.once(AudioPlayerStatus.Idle, (oldState, newState) => {
        clearInterval(timeOutCheckPlaying);
        serverPlayer.idleTimer = setTimeout(() => {
            serverPlayer.voiceConnection.disconnect();
        }, 15 * 60 * 1000); // 15 minutes

        setTimeout(() => {
            const songCurrentIndex = serverPlayer.playlist.indexOf(playlistEntry);
            if (songCurrentIndex !== -1) {
                serverPlayer.removeFromPlaylist(songCurrentIndex);
            }
        }, 4 * 60 * 60 * 1000); // Four hours

        serverPlayer.checkPlayingToNoOne(playlistEntry.originalVoiceChannelId, playlistEntry.message);

        if (playlistEntry.stopRadin) {
            return;
        }

        goToNextSong(serverPlayer);
    });
}

/**
 *
 * @param {ServerPlayer} serverPlayer
 * @returns {Promise<void>}
 */
function goToNextSong(serverPlayer) {
    serverPlayer.setCurrentSongIndex(serverPlayer.currentSongIndex + 1);

    if (serverPlayer.playlistHasEnded()) {
        return;
    }

    radin(serverPlayer);
}

/**
 *
 * @param {ServerPlayer} serverPlayer
 * @param {PlaylistEntry} playlistEntry
 * @param {boolean} sendMessage
 * @returns {Promise<boolean>}
 */
async function playReq(serverPlayer, playlistEntry, sendMessage) {
    const message = playlistEntry.message;
    const selectedSong = playlistEntry.ytInfo;

    try {
        const stream = await play.stream(selectedSong.url);
        const channelId = playlistEntry.originalVoiceChannelId;

        const joinOptions = {
            channelId,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
        };

        if (
            !serverPlayer.voiceConnection ||
            joinOptions.channelId !== serverPlayer.voiceConnection.joinConfig.channelId
        ) {
            serverPlayer.voiceConnection = joinVoiceChannel(joinOptions);
        } else if (serverPlayer.voiceConnection.state.status === VoiceConnectionStatus.Disconnected) {
            serverPlayer.voiceConnection.rejoin(joinOptions);
        }

        const connection = serverPlayer.voiceConnection;
        const audioPlayer = serverPlayer.audioPlayer;
        if (sendMessage) {
            message.channel.send(
                `Está tocando: ${selectedSong.title} (${selectedSong.url})\nA pedido de: ${message.member.displayName}`
            );
        }

        let resource = createAudioResource(stream.stream, {
            inputType: stream.type,
        });

        audioPlayer.play(resource);
        connection.subscribe(audioPlayer);

        console.log(
            `Tocando '${selectedSong.title}' a pedido de '${message.author.username}'(${message.author.id}) no servidor '${message.guild.name}'(${message.guildId})`
        );

        return true;
    } catch (e) {
        console.log(`Erro ao reproduzir música "${selectedSong.title}": ${e}\n${e.stack}`);
        message.channel.send(
            `Não foi possível reproduzir a música (${selectedSong.title})\nProvavelmente tem restrição de idade ou está privado @w@`
        );

        return false;
    }
}

module.exports = radin;
