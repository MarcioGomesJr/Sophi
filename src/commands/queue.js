const Command = require('../domain/Command');
const ServerPlayer = require('../domain/ServerPlayer');
const { EmbedBuilder, MessageReaction, User } = require('discord.js');
const { messageIsCommand } = require('../util/commandUtil');

const queue = new Command(
    (message, normalizedMessage) => {
        return messageIsCommand(normalizedMessage, ['queue', 'q']);
    },

    async (message, argument, serverPlayer) => {
        if (serverPlayer.playlist.length < 1) {
            message.channel.send('Não tem nada tocando ou na playlist =(');
            return;
        }

        const pageSize = 10;
        let numberOfPages = Math.ceil(serverPlayer.playlist.length / pageSize);
        let page = Math.floor(serverPlayer.currentSongIndex / pageSize);

        const nextSongs = buildQueueString(serverPlayer, page, pageSize, numberOfPages);
        const playlistMessage = buildQueueEmbed(nextSongs);
        const queueMessage = await message.channel.send({
            embeds: [playlistMessage],
        });

        // TODO validar se assim está sempre indo na ordem certa
        await Promise.all([
            queueMessage.react('🏠'),
            queueMessage.react('⏪'),
            queueMessage.react('◀️'),
            queueMessage.react('▶️'),
            queueMessage.react('⏩'),
        ]);

        /**
         *
         * @param {MessageReaction} reaction
         * @param {User} user
         * @returns {void}
         */
        const filter = (reaction, user) => {
            return user.id !== queueMessage.author.id && '🏠⏪◀️▶️⏩'.includes(reaction.emoji.name);
        };

        const collector = queueMessage.createReactionCollector({
            filter,
            time: 15 * 60 * 1000,
            max: 1000,
            dispose: true,
        });

        /**
         *
         * @param {MessageReaction} reaction
         * @param {User} user
         * @returns {void}
         */
        const changePage = (reaction, user) => {
            const emoji = reaction.emoji.name;
            numberOfPages = Math.ceil(serverPlayer.playlist.length / pageSize);

            switch (emoji) {
                case '🏠':
                    page = Math.floor(serverPlayer.currentSongIndex / pageSize);
                    break;
                case '⏪':
                    page = 0;
                    break;
                case '▶️':
                    if (page + 1 >= numberOfPages) {
                        return;
                    }
                    page++;
                    break;
                case '◀️':
                    if (page <= 0) {
                        return;
                    }
                    page--;
                    break;
                case '⏩':
                    page = numberOfPages - 1;
                    break;
            }

            const newQueue = buildQueueString(serverPlayer, page, pageSize, numberOfPages);
            queueMessage.edit({ embeds: [buildQueueEmbed(newQueue)] });
        };

        collector.on('collect', changePage);
        collector.on('remove', changePage);
    }
);

/**
 *
 * @param {ServerPlayer} serverPlayer
 * @param {number} page
 * @param {number} pageSize
 * @param {number} numberOfPages
 * @returns {string}
 */
function buildQueueString(serverPlayer, page, pageSize, numberOfPages) {
    const queueFirstIndex = page * pageSize;

    return (
        serverPlayer.playlist.slice(queueFirstIndex, queueFirstIndex + pageSize).reduce((acc, playlistEntry, index) => {
            index += queueFirstIndex;

            const ytInfo = playlistEntry.ytInfo;
            const currentSongInfo = index === serverPlayer.currentSongIndex ? ' **-> Tocando atualmente :3**' : '';

            return acc + `${index + 1} - ${ytInfo.title} ${currentSongInfo}\n${ytInfo.url}\n`;
        }, '') + `\n**${page + 1}/${numberOfPages}**`
    );
}

/**
 *
 * @param {string} nextSongs
 * @returns {EmbedBuilder}
 */
function buildQueueEmbed(nextSongs) {
    return new EmbedBuilder()
        .setColor(0x1f85de)
        .setTitle('**Playlist**')
        .setDescription('As próximas músicas a serem tocadas =^.^=\n\n' + nextSongs);
}

module.exports = queue;
