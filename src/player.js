const play = require('play-dl');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior, AudioPlayerStatus } = require('@discordjs/voice');

module.exports = async function radin(serverPlayer, sendMessage=true) {
    const playlistEntry = serverPlayer.getCurrentEntry();
    const audioPlayer = await playReq(playlistEntry, sendMessage);

    serverPlayer.currentAudioPlayer = audioPlayer;

    const timeOutCheckPlaying = setTimeout(() => {
        if (serverPlayer.notPlayingOrPaused()) {
            serverPlayer.skipToSong(serverPlayer.currentSongIndex, false);
        }
    }, 5000);

    audioPlayer.on(AudioPlayerStatus.Idle, (oldState, newState) => {
        clearTimeout(timeOutCheckPlaying);
        setTimeout(() => {
            const songCurrentIndex = serverPlayer.playlist.indexOf(playlistEntry);
            if (songCurrentIndex !== -1) {
                serverPlayer.removeFromPlaylist(songCurrentIndex);
            }
        }, 3600000); // One hour

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

async function playReq(playlistEntry, sendMessage) {
    const message = playlistEntry.message;

    const connection = joinVoiceChannel({
        channelId : message.member.voice.channel.id,
        guildId : message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
    });

    const audioPlayer = createAudioPlayer({
        behaviors:{
            noSubscriber: NoSubscriberBehavior.Play,
        }
    });

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

    return audioPlayer;
}
