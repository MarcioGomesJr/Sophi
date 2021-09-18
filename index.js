
const play  =  require('play-dl');
const Sophi = require('discord.js');
const { Intents } = require('discord.js');
const client = new Sophi.Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.DIRECT_MESSAGES] , partials : ['CHANNEL', 'MESSAGE']});
const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior, StreamType, demuxProbe, AudioPlayerStatus, VoiceConnectionStatus, getVoiceConnection  } = require('@discordjs/voice');
const token  = require ('./src/token').token

client.on('ready', () => {
    client.user.setActivity('!ajuda para saber mais', { type: 'LISTENING'});
    console.log(`Logged in as ${client.user.tag}!`);
});


client.on('messageCreate', async message => {

    if(message.content.startsWith('!play') || message.content.startsWith('!stop')){

        if (!message.member.voice?.channel) return message.channel.send('Você precisa estar conectado à uma sala de voz para fazer isto :s');

        const connection = joinVoiceChannel({
            channelId : message.member.voice.channel.id,
            guildId : message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
        })
        
        let url ='https://www.youtube.com/watch?v=VCkFSe3voRc'
        let stream = await play.stream(url)

        let resource = createAudioResource(stream.stream, {
            inputType: stream.type
        })

        let audioPlayer = createAudioPlayer({
            behaviors:{
                noSubscriber: NoSubscriberBehavior.Play
            }
        })

        player.play(resource);

        connection.subscribe(audioPlayer);
        
        if(message.content.startsWith('!stop')){
            player.stop(true);
        }
    }
});


client.login(token);



