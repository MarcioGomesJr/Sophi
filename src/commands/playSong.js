// Comandos para adicionar músicas na playlist
const playdl = require('play-dl');
const ytdl = require('ytdl-core');
const radin = require('../player');
const Command = require('../domain/Command');
const PlaylistEntry = require('../domain/PlaylistEntry');
const { messageStartsWithCommand } = require('../util/commandUtil');
const { resolveIndex, getIndexRegex } = require('../util/indexUtil');
const SophiError = require('../domain/SophiError');
const { getSpotifyClient } = require('../util/singletonManager');

const spotifyClient = getSpotifyClient();

// TODO Implementar limitação da duração dos vídeos e pesquisa
async function searchTrack(searchTerm) {
    if (searchTerm.startsWith('https')) {

        if (searchTerm.includes('spotify') && spotifyClient) {
            return searchSpotify(searchTerm);
        } else if (playdl.yt_validate(searchTerm) === false && !ytdl.validateURL(searchTerm)) {
            return [null, 'Infelizmente só consigo reproduzir links do YouTube ou Spotify a'];
        }

        // Supostamente é uma playlist do youtube. Validamos desse jeito pois se o vídeo faz parte de uma playlist
        // o play-dl.yt_validate identifica como uma playlist, e não queremos isso.
        if (searchTerm.includes('/playlist?list')) {
            return searchYoutubePlaylist(searchTerm);
        }

        searchTerm = searchTerm.replace(/&.+$/gi, '');

        try {
            const basicInfo = await ytdl.getBasicInfo(searchTerm);
            const ytInfo = {
                title: basicInfo.videoDetails.title,
                url: searchTerm,
            };
            return [[ytInfo], null];
        } catch (e) {
            console.log(`Erro ao buscar informação da música ${searchTerm}\n`, e);
            throw new SophiError(`Não consegui obter informações do vídeo ${searchTerm} ~w~\nProvavelmetne é privada ou com restrição de idade a`);
        }
    }

    const [ytInfo] = await playdl.search(searchTerm, { source: { youtube: 'video' }, limit: 1, fuzzy: true });

    if (!ytInfo) {
        return [null, 'Infelizmente sua pesquisa não foi encontrada ou não é um link de um vídeo no YouTube aa'];
    }

    if (ytInfo.discretionAdvised) {
        return [null, `Não foi possível reproduzir a música (${ytInfo.title})\nPois ela tem restrição de idade @w@`];
    }

    return [[ytInfo], null];
}

async function searchSpotify(searchTerm) {
    const id = searchTerm.split('/').pop();
    if (searchTerm.includes('playlist')) {
        const playlistData = await spotifyClient.getPlaylist(id, { limit: 50, offset: 0 });

        if (!playlistData) {
            return [null, 'Esse não parece um link válido de uma playlist do spotify a'];
        }

        const items = playlistData.body.tracks.items.map(it => it.track.id);
        const tracks = await getTracksFromSpotifyIdList(items);

        return [tracks, null];
    } else if (searchTerm.includes('album')) {
        const albumData = await spotifyClient.getAlbumTracks(id, { limit: 50, offset: 0 });

        if (!albumData) {
            return [null, 'Esse não parece um link válido de um álbum spotify a'];
        }

        const items = albumData.body.tracks.items.map(it => it.id);
        const tracks = await getTracksFromSpotifyIdList(items);

        return [tracks, null];
    } else {
        return searchSpotifyTrack(id);
    }
}

async function getTracksFromSpotifyIdList(spotifyIdList) {
    return Promise.all(
        spotifyIdList.map(async (id) => {
            const trackInfo = await searchSpotifyTrack(id);
            return trackInfo[0][0];
        })
    );
}

async function searchSpotifyTrack(trackId) {
    const data = await spotifyClient.getTrack(trackId);

    if (!data) {
        return [null, 'Esse não parece um link válido do spotify a'];
    }

    const newSearchTerm = `${data.body.artists.map(artist => artist.name)} ${data.body.name}`;
    return searchTrack(newSearchTerm);
}

async function searchYoutubePlaylist(playlistUrl) {
    if (playdl.yt_validate(playlistUrl) !== 'playlist') {
        return [null, 'Infelizmente só consigo reproduzir links de vídeos ou playlists do YouTube a'];
    }

    let videos = null;

    try {
        const playlistInfo = await playdl.playlist_info(playlistUrl, { incomplete: true });
        await playlistInfo.fetch();
        videos = await playlistInfo.page(1);
    } catch(e) {
        console.log(`Erro ao obter músicas da playlist: "${playlistUrl}": ${e}\n${e.stack}`);
    }

    if (!videos) {
        return [null, 'Infelizmente ocorreu um erro ao ler os vídeos dessa playlist do YouTube aa'];
    }

    return [videos, null];
}

function playOrAddToPlaylist(message, serverPlayer, ytInfos, asNext = false) {
    const playlistHasEnded = serverPlayer.playlistHasEnded();

    if (ytInfos.length > 1) {
        message.reply(
            `Um total de (${ytInfos.length}) músicas foram adicionadas ${asNext ? 'como as próximas' : ''} na queue e.e`
        );
    } else if (!playlistHasEnded) {
        message.reply(`Sua música (${ytInfos[0].title}) foi adicionada ${asNext ? 'como a próxima' : ''} na queue e.e`);
    }

    ytInfos.forEach((ytInfo, index) => {
        const playlistEntry = new PlaylistEntry(message, ytInfo);

        serverPlayer.addToPlaylist(playlistEntry, asNext);

        if (playlistHasEnded && index == 0) {
            radin(serverPlayer);
        }
    });
}

const play = new Command(
    (message, normalizedMessage) => {
        return messageStartsWithCommand(normalizedMessage, ['play', 'p']);
    },

    async (message, argument, serverPlayer) => {
        const [ytInfos, error] = await searchTrack(argument);

        if (error) {
            return message.reply(error);
        }

        playOrAddToPlaylist(message, serverPlayer, ytInfos);
    }
);

const playNext = new Command(
    (message, normalizedMessage) => {
        return messageStartsWithCommand(normalizedMessage, ['playnext', 'pn']);
    },

    async (message, argument, serverPlayer) => {
        const [ytInfos, error] = await searchTrack(argument);

        if (error) {
            return message.reply(error);
        }

        playOrAddToPlaylist(message, serverPlayer, ytInfos, true);
    }
);

const playAgain = new Command(
    (message, normalizedMessage) => {
        return messageStartsWithCommand(normalizedMessage, ['playagain', 'pa']);
    },

    async (message, argument, serverPlayer) => {
        const result = getIndexRegex().exec(argument);
        if (!result) {
            return message.reply('Uso errado do comando! Deve ser -pa 3 por exemplo :v');
        }

        const index = resolveIndex(result[1], serverPlayer);
        serverPlayer.checkValidIndex(index);
        const playlistEntry = serverPlayer.playlist[index];

        playOrAddToPlaylist(message, serverPlayer, [playlistEntry.ytInfo]);
    }
);

module.exports = [play, playNext, playAgain];
