const play  =  require('play-dl');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior, AudioPlayerStatus } = require('@discordjs/voice');

module.exports = async function radin(serverPlayer) {
    const playlist = serverPlayer.playlist;
    const playlistEntry = playlist[0];
    const audioPlayer = await playReq(playlistEntry, serverPlayer);

    audioPlayer.on(AudioPlayerStatus.Idle, (message) => {
        playlist.shift();
        if(playlist.length === 0) return;
        radin(serverPlayer);
    })
}

async function playReq(playlistEntry, serverPlayer) {
    const message = playlistEntry.message;

    const connection = joinVoiceChannel({
        channelId : message.member.voice.channel.id,
        guildId : message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
    })

    const audioPlayer = createAudioPlayer({
        behaviors:{
            noSubscriber: NoSubscriberBehavior.Play
        }
    });

    serverPlayer.currentAudioPlayer = audioPlayer;

    const selectedSong = playlistEntry.ytInfo;
    const stream = await play.stream(selectedSong.url);

    message.reply('Está tocando: ' + selectedSong.title + ' (' + selectedSong.url + ')');
    
    let resource = createAudioResource(stream.stream, {
        inputType: stream.type
    });
    
    audioPlayer.play(resource);
    connection.subscribe(audioPlayer);

    return audioPlayer;
}
