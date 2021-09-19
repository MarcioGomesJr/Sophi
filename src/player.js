
const play  =  require('play-dl');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior, StreamType, demuxProbe, AudioPlayerStatus, VoiceConnectionStatus, getVoiceConnection  } = require('@discordjs/voice');

module.exports = {

    async player(message, playlists, audioPlayer){
    
        const connection = joinVoiceChannel({
            channelId : message.member.voice.channel.id,
            guildId : message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
        })

        let search = message.content.substring(2);
        let stream = null;
        
        playlists.push(search);
        
        if(playlists[0] !== null){

            try{
                stream = await play.stream(playlists[0])
            }

            catch(TypeError){
                let yt_info = await play.search(playlists[0], { limit : 1 })
                stream = await play.stream(yt_info[0].url)
                message.reply('Está tocando: ' + yt_info[0].url)
            }

            let resource = createAudioResource(stream.stream, {
                inputType: stream.type
            });
            
            audioPlayer.play(resource);
            connection.subscribe(audioPlayer);

            playlists.pop();
         }
    

        if(message.content.startsWith('!stop')){
            audioPlayer.stop(true);
        }   
    }  
} 
