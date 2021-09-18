const Sophi = require('discord.js');
const memes = require('./src/memes');
const client = new Sophi.Client();


client.on('ready', () => {
    client.user.setActivity('!ajuda para saber mais', { type: 'LISTENING'});
    console.log(`Logged in as ${client.user.tag}!`);
});

const comandos = [memes.mengao, memes.waldemar, memes.kidbengala, memes.ajuda];

client.on('message', async msg => {

    if(msg.author.id === client.user.id || msg.content[0] !== '!'){ 
        return;
    }
    
    comandos.forEach(meme => {
        meme(msg)
    });
    
});

client.login('ODAxMjg4Njg2MTc1OTExOTg2.YAegPg.YH3KpiJsJd8n5NUyiebk5H-cmuc');
