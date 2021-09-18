
const play  =  require('play-dl');
const Sophi = require('discord.js');
const { Intents } = require('discord.js');
const client = new Sophi.Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.DIRECT_MESSAGES] , partials : ['CHANNEL', 'MESSAGE']});


let search = await message.content.split(' ');

let stream = await play.stream(search);

let resource = createAudioResource(stream.stream, {
        inputType: stream.type
});

let audioPlayer = createAudioPlayer({
    behaviors:{
        noSubscriber: NoSubscriberBehavior.Play
    }
});
