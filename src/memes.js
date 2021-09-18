const ytdl = require('ytdl-core-discord');

async function tocar(url, msg){
    const connection = await msg.member.voice.channel.join();
    connection.play(await ytdl(url), {type: 'opus'}).on("finish", () => {
        msg.member.voice.channel.leave();
    });
}

module.exports = {
    
    async ajuda(msg){
        if(msg.content === '!ajuda'){
            url = 'https://www.youtube.com/watch?v=raClhK0dbts';
            tocar(url, msg);
            msg.reply('Meu nome é Sophi e eu possuo vários arquivo dos Grandes Momentos da História Brasileira UwU');
            msg.reply('Se você lembrar de algum, é só digitar "!+palavra-chave" (sem aspas) que talvez eu tenha algo sobre G-G');
            msg.reply('Ao mais, estamos em pré-alpha, então ainda estou coletando arquivos, mas você pode tentar !kidbengala, !mengao ou !waldemar');
        }

    },

    async mengao(msg){
        if(msg.content === '!mengao'){
            msg.reply('algumas pessoas ficam até tarde torcendo contra o Flamengo.');
            url = 'https://www.youtube.com/watch?v=26vI5CyNd7U';
            tocar(url, msg);
            
        }
    },

    async waldemar(msg){
        if(msg.content === '!waldemar'){
            msg.reply('em 2003 o diretor Eduardo Moraes anunciava Senhor Waldemar como o novo técnico do Flamengo.');
            url = 'https://www.youtube.com/watch?v=Sq1Qimqdfcg';
            tocar(url, msg);
        }    
    },

    async kidbengala(msg){
        if(msg.content === '!kidbengala'){
            channel.send('A moça que acompanha o Senhor Kid Bengala recusa a favorece-lo');
            url = 'https://www.youtube.com/watch?v=6Dp8uTXuMQE';
            tocar(url, msg);
        }
    },

};