// Comando para o bot remover uma música específica da playlist por index
const Command = require("../domain/Command");
const resolveIndex = require('../util/resolveIndex');
const { messageStartsWithCommand } = require('../util/commandUtil');

const remove = new Command(
    (message, normalizedMessage) => {
        return messageStartsWithCommand(normalizedMessage, ['remove', 'r']);
    },

    async (message, argument, serverPlayer) => {
        const result = /^\s*(\d+|last|next)/g.exec(argument);
        if (!result) {
            return message.reply('Uso errado do comando! Deve ser -r 3 por exemplo :v');
        }

        const index = resolveIndex(result[1], serverPlayer);
        
        try {
            const removedEntry = serverPlayer.removeFromPlaylist(index);

            message.channel.send(`Música ${removedEntry.ytInfo.title} removida OwO`);
        } catch (e) {
            return message.reply(e.message);
        }
    }
);

module.exports = remove;