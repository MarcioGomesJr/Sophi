// Comando para manipular a playlist movendo elementos dela pelos indexes
const Command = require("../domain/Command");

const skip = new Command(
    (message, normalizedMessage) => {
        if (normalizedMessage.startsWith('mv ')) {
            return [true, normalizedMessage.substring(3)];
        }
        return [false, ''];
    },

    async (message, argument, serverPlayer) => {
        const indexes = /[^\d]*(\d+) [^\d]*(\d+)/g.exec(argument);

        if (!indexes) {
            return message.reply('Uso errado do comando! Deve ser -mv 3 2 por exemplo');
        }

        const from = new Number(indexes[1]) - 1;
        const to = new Number(indexes[2]) - 1;

        try {
            serverPlayer.move(from, to);
        } catch (e) {
            return message.reply(e.message);
        }

        message.channel.send('Músicas movidas uwu');
    }
);

module.exports = skip;
