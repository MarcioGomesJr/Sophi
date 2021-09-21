const data = 'ytdl-core'
const play  =  require('play-dl');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, 
    NoSubscriberBehavior, StreamType, demuxProbe, 
    AudioPlayerStatus, VoiceConnectionStatus, getVoiceConnection,  
    AudioPlayerPlayingState } = require('@discordjs/voice');




module.exports = async function radin(playlists, currentAudioPlayer, songName){
    const message = playlists[0];
    const audioPlayer = await playReq(message, currentAudioPlayer, songName);
    audioPlayer.on(AudioPlayerStatus.Idle, (message) =>{
        playlists.shift();
        if(playlists.length === 0) return;
        radin(playlists, currentAudioPlayer, songName);
    })
}

async function playReq(message, currentAudioPlayer, songName){   
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

    
    try{
        stream = await play.stream(search);
        songName['1'] = search;
    }

    catch(TypeError){
        let yt_info = await play.search(search, { limit : 1 });
        stream = await play.stream(yt_info[0].url);
        songName['1'] = yt_info[0].title;
        message.reply('Está tocando: ' + songName['1'] + ' - ' + yt_info[0].url);
    }
    
    let resource = createAudioResource(stream.stream, {
        inputType: stream.type
    });
    
    audioPlayer.play(resource);
    connection.subscribe(audioPlayer);
    return audioPlayer;
}

