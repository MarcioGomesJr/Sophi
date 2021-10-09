const play = require('play-dl');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior, AudioPlayerStatus } = require('@discordjs/voice');

module.exports = async function radin(serverPlayer) {
    const playlist = serverPlayer.playlist;
    const playlistEntry = serverPlayer.getCurrentEntry();
    const audioPlayer = await playReq(playlistEntry, serverPlayer);

    serverPlayer.currentAudioPlayer = audioPlayer;

    audioPlayer.on(AudioPlayerStatus.Idle, (oldState, newState) => {
        if (playlistEntry.stopRadin) {
            return;
        }

        serverPlayer.currentSongIndex++;

        if (playlist.length === serverPlayer.currentSongIndex) {
            return;
        }

        radin(serverPlayer);
    });

    audioPlayer.on(AudioPlayerStatus.Buffering, (oldState, newState) => {
        if (oldState.status === 'playing') {
            console.log('Bugou?');
        }
    });
}

async function playReq(playlistEntry) {
    const message = playlistEntry.message;

    const connection = joinVoiceChannel({
        channelId : message.member.voice.channel.id,
        guildId : message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
    });

    const audioPlayer = createAudioPlayer({
        behaviors:{
            noSubscriber: NoSubscriberBehavior.Stop,
        }
    });

    const selectedSong = playlistEntry.ytInfo;
    const stream = await play.stream(selectedSong.url);

    message.channel.send(`Está tocando: ${selectedSong.title} (${selectedSong.url})\nA pedido de: ${message.member.displayName}`);
    
    let resource = createAudioResource(stream.stream, {
        inputType: stream.type
    });
    
    audioPlayer.play(resource);
    connection.subscribe(audioPlayer);

    return audioPlayer;
}
