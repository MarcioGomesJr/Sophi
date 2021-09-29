const play  =  require('play-dl');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior, AudioPlayerStatus } = require('@discordjs/voice');

module.exports = async function radin(playlists, currentAudioPlayer) {
    const message = playlists[0];
    const audioPlayer = await playReq(message, currentAudioPlayer);

    audioPlayer.on(AudioPlayerStatus.Idle, (message) => {
        playlists.shift();
        if(playlists.length === 0) return;
        radin(playlists, currentAudioPlayer);
    })
}

async function playReq(message, currentAudioPlayer) {
    const connection = joinVoiceChannel({
        channelId : message.member.voice.channel.id,
        guildId : message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
    })

    let audioPlayer = createAudioPlayer({
        behaviors:{
            noSubscriber: NoSubscriberBehavior.Play
        }
    });

    currentAudioPlayer['1'] = audioPlayer;

    let search = message.content.substring(3);
    let stream = null;
    
    try {
        stream = await play.stream(search);
    }
    catch(TypeError) {
        let yt_info = await play.search(search, { limit : 1 });
        let selectedSong = yt_info[0];

        stream = await play.stream(selectedSong.url);
        message.reply('Está tocando: ' + selectedSong.title + ' (' + selectedSong.url + ')');
    }
    
    let resource = createAudioResource(stream.stream, {
        inputType: stream.type
    });
    
    audioPlayer.play(resource);
    connection.subscribe(audioPlayer);

    return audioPlayer;
}
