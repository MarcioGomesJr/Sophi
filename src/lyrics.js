const Genius = require('genius-lyrics');
const genius = new Genius.Client('p2EmQ6_It6yA6sQetBFgJyifOOzNL6H4NKEuOHRjeByMssxF5mu5x7yyDqbIN0v0vzOxPH8Z3YW6gs1AD2mjQg');


module.exports = async function lyrics(message, songName){
    if(message.content === '-l'){   
        // try{ 
            const searches = await genius.songs.search("faded");
            const letra  = searches[0];
            const lyrics = await letra.lyrics();
            message.reply ('Lyrics for ' + "faded" + ': \n' + lyrics);
        // }
        // catch(Error){
        //     message.reply("Não foi possível encontrar a letra para essa musga, você pode tentar '-l nome da musica' mas não prometo nada ;-;")
        // }
    }

    if(message.content.startsWith === '-l '){       
        try{        
        searches = await genio.songs.search(message.content.substring(3));
        console.log(searches[0]);
        message.reply('Lyrics for ' + message.content.substring(3) + ': \n' + searches[0].lyrics());
        }
        
        catch(Error){
            message.reply('Tu é o bixão memo doido, tem letra dessa música aqui não maluco ._.');
        }
    }
}