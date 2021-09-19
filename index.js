
const play  =  require('play-dl');
const Sophi = require('discord.js');
const { Intents } = require('discord.js');
const client = new Sophi.Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.DIRECT_MESSAGES] , partials : ['CHANNEL', 'MESSAGE']});
const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior, StreamType, demuxProbe, AudioPlayerStatus, VoiceConnectionStatus, getVoiceConnection  } = require('@discordjs/voice');
const token  = require ('./src/token').token;
const player  = require ('./src/player').player;

const playlists = [];

client.on('ready', () => {
    client.user.setActivity('!ajuda para saber mais', { type: 'LISTENING'});
    console.log(`Logged in as ${client.user.tag}!`);
});

let audioPlayer = createAudioPlayer({
    behaviors:{
    noSubscriber: NoSubscriberBehavior.Play
    }
});


client.on('messageCreate', async message => {

    if(message.content.startsWith('!') || message.content.startsWith('!stop')){

        if (!message.member.voice?.channel) return message.channel.send('Você precisa estar conectado à uma sala de voz para fazer isto :s');
        
        player(message, playlists, audioPlayer);
        
    }

});


client.login(token);



