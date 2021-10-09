const Command = require("../domain/Command");
const { MessageEmbed } = require('discord.js');

const queue = new Command(
    (message, normalizedMessage) => {
        if (normalizedMessage === 'q') {
            return [true, ''];
        }
        return [false, ''];
    },

    async (message, argument, serverPlayer) => {
        if (serverPlayer.playlist.length < 1) {
            message.channel.send('Não tem nada tocando ou na playlist =(');
            return;
        }

        const nextSongs = serverPlayer.playlist.reduce((acc, playlistEntry, index) => {
            const ytInfo = playlistEntry.ytInfo;
            acc += `${index + 1} - ${ytInfo.title}`;

            if (index === serverPlayer.currentSongIndex) {
                acc += ' -> Tocando atualmente :3';
            }

            return acc + '\n';
        }, '');

        const playlistMessage = new MessageEmbed()
        .setColor(0x1F85DE)
        .setTitle('**Playlist**')
        .setDescription('As próximas músicas a serem tocadas =^.^=\n\n' + nextSongs);

        message.channel.send({ embeds: [playlistMessage] });
    }
);

module.exports = queue;
