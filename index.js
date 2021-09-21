
const play  =  require('play-dl');
const Sophi = require('discord.js');
const { Intents } = require('discord.js');
const client = new Sophi.Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.DIRECT_MESSAGES] , partials : ['CHANNEL', 'MESSAGE']});
const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior, StreamType, demuxProbe, AudioPlayerStatus, VoiceConnectionStatus, getVoiceConnection  } = require('@discordjs/voice');
const token  = require('./src/token').token;
const skip = require('./src/skip');
const pause = require('./src/pause');
const playSong = require('./src/playSong');
const lyrics = require('./src/lyrics');

const playlists = [];
const currentAudioPlayers = {
    '1': null,
}; 
const songName = {'1': null,};

client.on('ready', () => {
    client.user.setActivity('indie babe uwu', { type: 'LISTENING'});
    console.log(`Logged in as ${client.user.tag}!`);
});



client.on('messageCreate', async message => {
    if(message.author.id === client.user.id || message.content[0] !== '-'){ 
        return;
    }

    if (!message.member.voice?.channel) return message.channel.send('Você precisa estar conectado à uma sala de voz para fazer isto :s');

    playSong(message, playlists, currentAudioPlayers, songName);
    skip(currentAudioPlayers, message);
    pause(currentAudioPlayers, message);
    lyrics(message, songName['1'])
});


client.login(token);



