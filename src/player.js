const play = require('play-dl');
const { joinVoiceChannel, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');

module.exports = async function radin(serverPlayer, sendMessage=true) {
    const playlistEntry = serverPlayer.getCurrentEntry();
    await playReq(serverPlayer, playlistEntry, sendMessage);

    clearTimeout(serverPlayer.idleTimer);

    const timeOutCheckPlaying = setTimeout(() => {
        if (serverPlayer.notPlayingOrPaused()) {
            serverPlayer.skipToSong(serverPlayer.currentSongIndex, false);
        }
    }, 5000);

    serverPlayer.audioPlayer.once(AudioPlayerStatus.Idle, (oldState, newState) => {
        clearTimeout(timeOutCheckPlaying);
        serverPlayer.idleTimer = setTimeout(() => {
            serverPlayer.voiceConnection.disconnect();
        }, 15 * 60000);

        setTimeout(() => {
            const songCurrentIndex = serverPlayer.playlist.indexOf(playlistEntry);
            if (songCurrentIndex !== -1) {
                serverPlayer.removeFromPlaylist(songCurrentIndex);
            }
        }, 10800000); // Three hours

        if (playlistEntry.stopRadin) {
            return;
        }

        serverPlayer.currentSongIndex++;

        if (serverPlayer.playlistHasEnded()) {
            return;
        }

        radin(serverPlayer);
    });
}

async function playReq(serverPlayer, playlistEntry, sendMessage) {
    const message = playlistEntry.message;
    const joinOptions = {
        channelId : message.member.voice.channel.id,
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

    const selectedSong = playlistEntry.ytInfo;
    const stream = await play.stream(selectedSong.url);

    if (sendMessage) {
        message.channel.send(`Está tocando: ${selectedSong.title} (${selectedSong.url})\nA pedido de: ${message.member.displayName}`);
    }
    
    let resource = createAudioResource(stream.stream, {
        inputType: stream.type
    });
    
    audioPlayer.play(resource);
    connection.subscribe(audioPlayer);
}
