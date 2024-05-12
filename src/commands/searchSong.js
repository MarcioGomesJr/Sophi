// Commando to search a term and pick one between several options
const Command = require('../domain/Command');
const { YouTubeVideo } = require('play-dl');
const { searchYoutube } = require('../botfunctions/searchTrack');
const { messageStartsWithCommand } = require('../util/commandUtil');
const { EmbedBuilder, MessageCollector, User, Message } = require('discord.js');
const playOrAddToPlaylist = require('../botfunctions/playOrAddToPlaylist');
const ServerPlayer = require('../domain/ServerPlayer');

const search = new Command(
    (message, normalizedMessage) => {
        return messageStartsWithCommand(normalizedMessage, ['search', 'find', 'f']);
    },

    async (message, argument, serverPlayer) => {
        await searchSong(message, argument, serverPlayer, false);
    }
);

const searchNext = new Command(
    (message, normalizedMessage) => {
        return messageStartsWithCommand(normalizedMessage, ['searchNext', 'findNext', 'fn']);
    },

    async (message, argument, serverPlayer) => {
        await searchSong(message, argument, serverPlayer, true);
    }
);

/**
 *
 * @param {Message} message
 * @param {string} argument
 * @param {ServerPlayer} serverPlayer
 * @param {boolean} asNext
 * @returns {Promise<void>}
 */
async function searchSong(message, argument, serverPlayer, asNext) {
    let [options, error] = await searchYoutube(argument, 10);

    if (error) {
        return message.reply(error);
    }

    options = options.filter((ytInfo) => !ytInfo.discretionAdvised).slice(0, 5);

    const optionsEmbed = buildOptionsEmbed(options);
    const optionsMessage = await message.reply({
        embeds: [optionsEmbed],
    });

    /**
     *
     * @param {Message} m
     * @returns {boolean}
     */
    const filter = (m) => {
        return m.author.id === message.author.id && m.reference?.messageId === optionsMessage.id;
    };
    const collector = new MessageCollector(message.channel, { filter, time: 60 * 1000 });

    collector.on('collect', (m) => {
        const index = Number.parseInt(m.content.replace(/\D/gi, ''));
        if (Number.isNaN(index) || index < 1 || index > options.length) {
            return m.reply(`Por favor, responda com um número entre 1 e ${options.length}`);
        }

        const selected = options[index - 1];

        playOrAddToPlaylist(message, serverPlayer, [selected], asNext);

        collector.stop('chosen');
    });

    collector.on('end', (_, reason) => {
        if (reason === 'chosen') {
            return;
        }
        optionsMessage.reply(`Nenhuma opção selecionada. Nada foi adicionado à playlist =()`);
    });
}

/**
 *
 * @param {YouTubeVideo[]} options
 * @returns {EmbedBuilder}
 */
function buildOptionsEmbed(options) {
    const optionsString = options.reduce((acc, ytInfo, index) => {
        return acc + `\n**${1 + index})** ${ytInfo.title} **do canal** ${ytInfo.channel.name}\n`;
    }, '');

    return new EmbedBuilder()
        .setColor(0x1f85de)
        .setTitle('**Escolha uma**')
        .setDescription('Resultados da pesquisa, escolha um respondendo essa mensagem =^.^=\n' + optionsString);
}

module.exports = { search, searchNext };
