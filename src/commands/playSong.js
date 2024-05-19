// Comandos para adicionar músicas na playlist
const Command = require('../domain/Command');
const { messageStartsWithCommand } = require('../util/commandUtil');
const { resolveIndex, getIndexRegex } = require('../util/indexUtil');
const { searchTrack } = require('../botfunctions/searchTrack');
const playOrAddToPlaylist = require('../botfunctions/playOrAddToPlaylist');

const play = new Command(
    (_message, normalizedMessage) => {
        return messageStartsWithCommand(normalizedMessage, ['play', 'p']);
    },

    async (message, argument, serverPlayer) => {
        const [ytInfos, error] = await searchTrack(argument);

        if (error) {
            message.reply(error);
            return;
        }

        await playOrAddToPlaylist(message, serverPlayer, ytInfos);
    }
);

const playNext = new Command(
    (_message, normalizedMessage) => {
        return messageStartsWithCommand(normalizedMessage, ['playnext', 'pn']);
    },

    async (message, argument, serverPlayer) => {
        const [ytInfos, error] = await searchTrack(argument);

        if (error) {
            message.reply(error);
            return;
        }

        await playOrAddToPlaylist(message, serverPlayer, ytInfos, true);
    }
);

const playAgain = new Command(
    (_message, normalizedMessage) => {
        return messageStartsWithCommand(normalizedMessage, ['playagain', 'pa']);
    },

    async (message, argument, serverPlayer) => {
        const result = getIndexRegex().exec(argument);
        if (!result) {
            message.reply('Uso errado do comando! Deve ser -pa 3 por exemplo :v');
            return;
        }

        const index = resolveIndex(result[1], serverPlayer);
        serverPlayer.checkValidIndex(index);
        const playlistEntry = serverPlayer.playlist[index];

        await playOrAddToPlaylist(message, serverPlayer, [playlistEntry.ytInfo]);
    }
);

module.exports = { play, playNext, playAgain };
