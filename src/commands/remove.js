// Comando para o bot remover uma música específica da playlist por index
const Command = require("../domain/Command");
const { MessageEmbed } = require('discord.js');

const remove = new Command(
    (message, normalizedMessage) => {
        if (normalizedMessage.startsWith('r ')) {
            return [true, normalizedMessage.substring(2)];
        }
        return [false, ''];
    },

    async (message, argument, serverPlayer) => {
        const indexS = /^[^\d]*(\d+)/g.exec(argument);

        if (!indexS) {
            return message.reply('Uso errado do comando! Deve ser -r por exemplo :v');
        }

        const index = Number(indexS[1]) - 1;
        try {
            const removedEntry = serverPlayer.removeFromPlaylist(index);

            message.channel.send(`Música ${removedEntry.ytInfo.title} removida OwO`);
        } catch (e) {
            return message.reply(e.message);
        }
    }
);

module.exports = remove;