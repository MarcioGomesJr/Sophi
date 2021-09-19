
const play  =  require('play-dl');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior, StreamType, demuxProbe, AudioPlayerStatus, VoiceConnectionStatus, getVoiceConnection,  AudioPlayerPlayingState} = require('@discordjs/voice');

async function radin(playlists){
    const message = playlists[0];
    const audioPlayer = await playReq(message);
    audioPlayer.on(AudioPlayerStatus.Idle, (message) =>{
        playlists.shift()
        if(playlists.length === 0) return;
        radin(playlists);
    })
}

async function playReq(message){
        
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

    let search = message.content.substring(3);
    let stream = null;

    
    try{
        stream = await play.stream(search)
    }

    catch(TypeError){
        let yt_info = await play.search(search, { limit : 1 })
        stream = await play.stream(yt_info[0].url)
        message.reply('Está tocando: ' + yt_info[0].url)
    }
    
    let resource = createAudioResource(stream.stream, {
        inputType: stream.type
    });
    
    audioPlayer.play(resource);
    connection.subscribe(audioPlayer);
    return audioPlayer;
}

module.exports = { 
    async player(message, playlists){
        if(message.content.startsWith('!p')){
            if (!message.member.voice?.channel) return message.channel.send('Você precisa estar conectado à uma sala de voz para fazer isto :s');
            playlists.push(message);
            

            if(playlists.length === 1){
                radin(playlists);
            }
            
            else{
                message.reply('Sua música foi adicionada na queue');
            }
        }
    }
}