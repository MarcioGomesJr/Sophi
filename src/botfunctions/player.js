const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');
const {
    joinVoiceChannel,
    createAudioResource,
    AudioPlayerStatus,
    VoiceConnectionStatus,
    StreamType,
} = require('@discordjs/voice');
const ServerPlayer = require('../domain/ServerPlayer');
const PlaylistEntry = require('../domain/PlaylistEntry');
const logger = require('../util/logger');

/**
 *
 * @param {ServerPlayer} serverPlayer
 * @param {boolean} sendMessage
 * @returns {Promise<void>}
 */
async function radin(serverPlayer, sendMessage = true) {
    const playlistEntry = serverPlayer.getCurrentEntry();
    if (!playlistEntry) {
        logger.warn(`Playlist tinha acabado ${serverPlayer.guildId}`);
        return;
    }

    const sucesso = await playReq(serverPlayer, playlistEntry, sendMessage);

    if (!sucesso) {
        goToNextSong(serverPlayer);
        return;
    }

    clearTimeout(serverPlayer.idleTimer);

    serverPlayer.audioPlayer.once(AudioPlayerStatus.Idle, (_oldState, _newState) => {
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
    const { message, ytInfo: selectedSong, originalVoiceChannelId: channelId } = playlistEntry;

    try {
        const filePath = path.join('.', 'audio_cache', `${serverPlayer.guildId}.mp4`).toString();
        if (fs.existsSync(filePath)) {
            fs.rmSync(filePath);
        }

        const stream = ytdl(selectedSong.url, {
            filter: 'audioonly',
        });
        const writeStream = fs.createWriteStream(filePath);
        stream.pipe(writeStream);

        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
            stream.on('error', (error) => {
                logger.error(
                    `Erro em playstream música "${selectedSong.title}" server ${serverPlayer.guildId}.`,
                    error
                );
                reject(error);
                stream.unpipe();
                writeStream.close();
            });
        });

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

        if (sendMessage) {
            message.channel.send(
                `Está tocando: ${selectedSong.title} (${selectedSong.url}) (${selectedSong.durationRaw})\n` +
                    `A pedido de: ${message.member.displayName}`
            );
        }

        let resource = createAudioResource(filePath, {
            inputType: StreamType.Arbitrary,
        });

        serverPlayer.audioPlayer.play(resource);
        serverPlayer.playerSubscription = serverPlayer.voiceConnection.subscribe(serverPlayer.audioPlayer);

        let errorProcessed = false;
        serverPlayer.audioPlayer.on('error', (error) => {
            if (errorProcessed) {
                return;
            }
            errorProcessed = true;
            serverPlayer.audioPlayer.removeAllListeners();

            logger.warn(
                `Erro em audioplayer música "${selectedSong.title}" server ${serverPlayer.guildId}.`,
                error
            );
            playlistEntry.reties++;

            if (serverPlayer.skipToSong()) {
                radin(serverPlayer);
            }
        });

        logger.info(
            `Tocando '${selectedSong.title}' (${selectedSong.durationRaw}) a pedido de '${message.author.username}'` +
                `(${message.author.id}) no servidor '${message.guild.name}'(${serverPlayer.guildId})`
        );

        return true;
    } catch (e) {
        logger.error(`Erro ao reproduzir música "${selectedSong.title}" server ${serverPlayer.guildId}`, e);
        message.channel.send(
            `Não foi possível reproduzir a música (${selectedSong.title})\n` +
                `Provavelmente tem restrição de idade ou está privado @w@`
        );

        return false;
    }
}

module.exports = radin;
