const radin = require('./player')

module.exports = async function playSong(message, playlists, currentAudioPlayer){
    if(message.content.startsWith('-p ')){
        playlists.push(message);

        if(playlists.length === 1){
            radin(playlists, currentAudioPlayer);
        }

        else{
            message.reply('Sua música foi adicionada na queue e.e');
        
        }
    }
}