
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



client.on('messageCreate', async message => {
    if(message.author.id === client.user.id || message.content[0] !== '!'){ 
        return;
    }
    player(message, playlists);
    console.log(playlists);
});


client.login(token);



