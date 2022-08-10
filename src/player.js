const play = require('play-dl');
const { joinVoiceChannel, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');

async function radin(serverPlayer, sendMessage=true) {
    const playlistEntry = serverPlayer.getCurrentEntry();
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
        }, 900000); // 15 minutes

        setTimeout(() => {
            const songCurrentIndex = serverPlayer.playlist.indexOf(playlistEntry);
            if (songCurrentIndex !== -1) {
                serverPlayer.removeFromPlaylist(songCurrentIndex);
            }
        }, 10800000); // Three hours

        if (playlistEntry.stopRadin) {
            return;
        }

        goToNextSong(serverPlayer);
    });
}

function goToNextSong(serverPlayer) {
    serverPlayer.currentSongIndex++;

    if (serverPlayer.playlistHasEnded()) {
        return;
    }

    radin(serverPlayer);
}

async function playReq(serverPlayer, playlistEntry, sendMessage) {
    const message = playlistEntry.message;
    const selectedSong = playlistEntry.ytInfo;

    try {
        const stream = await play.stream(selectedSong.url);
        let channelId = message.member.voice?.channel?.id;
        if (!channelId) {
            channelId = playlistEntry.originalVoiceChannelId;
        }

        const joinOptions = {
            channelId,
            guildId : message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
        }

        if (!serverPlayer.voiceConnection || joinOptions.channelId !== serverPlayer.voiceConnection.joinConfig.channelId) {
            serverPlayer.voiceConnection = joinVoiceChannel(joinOptions);
        }
        else if (serverPlayer.voiceConnection.state.status === VoiceConnectionStatus.Disconnected) {
            serverPlayer.voiceConnection.rejoin(joinOptions);
        }

        const connection = serverPlayer.voiceConnection;
        const audioPlayer = serverPlayer.audioPlayer;
        if (sendMessage) {
            message.channel.send(`Está tocando: ${selectedSong.title} (${selectedSong.url})\nA pedido de: ${message.member.displayName}`);
        }

        let resource = createAudioResource(stream.stream, {
            inputType: stream.type
        });

        audioPlayer.play(resource);
        connection.subscribe(audioPlayer);

        return true;
    } catch(e) {
        console.log(`Erro ao reproduzir música "${selectedSong.title}": ${e}`);
        message.channel.send(`Não foi possível reproduzir a música (${selectedSong.title})\nProvavelmente tem restrição de idade ou está privado @w@`);
        
        return false;
    }
}

module.exports = radin;