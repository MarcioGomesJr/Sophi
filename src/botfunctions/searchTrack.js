const playdl = require('play-dl');
const ytdl = require('ytdl-core');
const { getSpotifyClient } = require('../util/clientManager');
const { formatDuration } = require('../util/formatUtil');
const logger = require('../util/logger');

const playlistLimit = 100;

/**
 *
 * @param {string} searchTerm
 * @returns {Promise<[playdl.YouTubeVideo[] | null, string | null]>}
 */
async function searchTrack(searchTerm) {
    if (searchTerm.startsWith('https')) {
        if (/^(spotify:|https:\/\/[a-z]+\.spotify\.com\/)/.test(searchTerm)) {
            return searchSpotify(searchTerm);
        }
        if (playdl.yt_validate(searchTerm) === false && !ytdl.validateURL(searchTerm)) {
            return [null, 'Infelizmente só consigo reproduzir links do YouTube ou Spotify a'];
        }

        // Supostamente é uma playlist do youtube. Validamos desse jeito pois se o vídeo faz parte de uma playlist
        // o play-dl.yt_validate identifica como uma playlist, e não queremos isso.
        if (searchTerm.includes('/playlist?list')) {
            return searchYoutubePlaylist(searchTerm);
        }

        return searchYoutubeLink(searchTerm);
    }

    const [ytInfo, error] = await searchYoutube(searchTerm, 1);

    if (error) {
        return [null, error];
    }

    if (ytInfo[0].discretionAdvised) {
        return [null, `Não foi possível reproduzir o vídeo (${ytInfo.title})\nPois ele tem restrição de idade @w@`];
    }

    return [ytInfo, null];
}

/**
 *
 * @param {string} searchTerm
 * @param {number} limit
 * @returns {Promise<[playdl.YouTubeVideo[] | null, string | null]>}
 */
async function searchYoutube(searchTerm, limit) {
    const ytInfos = await playdl.search(searchTerm, { source: { youtube: 'video' }, limit, fuzzy: true });

    if (ytInfos.length === 0) {
        return [null, 'Infelizmente sua pesquisa não foi encontrada =('];
    }

    return [ytInfos, null];
}

/**
 *
 * @param {string} spotifyLink
 * @returns {Promise<[playdl.YouTubeVideo[] | null, string]>}
 */
async function searchSpotify(spotifyLink) {
    const spotifyClient = await getSpotifyClient();
    if (!spotifyClient) {
        return [null, 'Infelizmente só consigo reproduzir links do YouTube no momento =x'];
    }
    try {
        spotifyLink = spotifyLink.replace(/&.+$/gi, '');
        const id = spotifyLink.split('/').pop();
        if (spotifyLink.includes('/playlist')) {
            const playlistData = await spotifyClient.getPlaylistTracks(id, { limit: playlistLimit, offset: 0 });

            if (!playlistData) {
                return [null, 'Esse não parece um link válido de uma playlist do spotify a'];
            }

            const tracks = playlistData.body.tracks.items.map((it) => it.track);

            return getYtInfosFromSpotifyTracks(tracks);
        } else if (spotifyLink.includes('/album')) {
            const albumData = await spotifyClient.getAlbumTracks(id, { limit: playlistLimit, offset: 0 });

            if (!albumData) {
                return [null, 'Esse não parece um link válido de um álbum spotify a'];
            }

            const tracks = albumData.body.tracks.items;

            return getYtInfosFromSpotifyTracks(tracks);
        } else {
            const trackData = await spotifyClient.getTrack(id);

            if (!trackData) {
                return [null, 'Esse não parece um link válido do spotify a'];
            }

            return searchSpotifyTrack(trackData.body);
        }
    } catch (e) {
        logger.error(`Erro ao buscar música pelo link do spotify: ${spotifyLink}`, e);
        return [null, 'Esse não parece ser um link válido do spotify =x'];
    }
}

// TODO o ideal seria isso ser lazy...
/**
 *
 * @param {any[]} spotifyTracks
 * @returns {Promise<[playdl.YouTubeVideo[], string]>}
 */
async function getYtInfosFromSpotifyTracks(spotifyTracks) {
    const infos = await Promise.all(
        spotifyTracks.slice(0, playlistLimit).map(async (track) => {
            const trackInfo = await searchSpotifyTrack(track);

            if (!trackInfo[0]) {
                return null;
            }

            return trackInfo[0][0];
        })
    );

    const foundInfos = infos.filter((it) => !!it);

    return [foundInfos, null];
}

/**
 *
 * @param {any[]} track
 * @returns {Promise<[playdl.YouTubeVideo[] | null, string | null]>}
 */
async function searchSpotifyTrack(track) {
    const artists = track.artists
        .slice(0, 2)
        .map((artist) => artist.name)
        .join(', ');
    const searchTerm = `${artists} ${track.name}`;
    return searchTrack(searchTerm);
}

/**
 *
 * @param {string} searchTerm
 * @returns {Promise<[playdl.YouTubeVideo[], string]>}
 */
async function searchYoutubeLink(searchTerm) {
    try {
        searchTerm = searchTerm.replace(/&.+$/gi, '');

        const basicInfo = await ytdl.getBasicInfo(searchTerm);
        const durationInSec = Number.parseInt(basicInfo.videoDetails.lengthSeconds);

        const ytInfo = {
            title: basicInfo.videoDetails.title,
            url: searchTerm,
            channel: {
                name: basicInfo.videoDetails.author.name,
            },
            durationInSec,
            durationRaw: formatDuration(durationInSec),
        };

        return [[ytInfo], null];
    } catch (e) {
        logger.error(`Erro ao buscar informação da música "${searchTerm}"`, e);
        return [
            null,
            `Não consegui obter informações do vídeo ${searchTerm} ~w~\nProvavelmente é privada ou com restrição de idade a`,
        ];
    }
}

/**
 *
 * @param {string} playlistUrl
 * @returns {Promise<[playdl.YouTubeVideo[] | null, string | null]>}
 */
async function searchYoutubePlaylist(playlistUrl) {
    if (playdl.yt_validate(playlistUrl) !== 'playlist') {
        return [null, 'Infelizmente só consigo reproduzir links de vídeos ou playlists do YouTube a'];
    }

    /**
     * @type {playdl.YouTubeVideo[]}
     */
    let videos = null;

    try {
        const playlistInfo = await playdl.playlist_info(playlistUrl, { incomplete: true });
        await playlistInfo.fetch();
        videos = playlistInfo.page(1);
    } catch (e) {
        logger.error(`Erro ao obter músicas da playlist: "${playlistUrl}"`, e);
    }

    if (!videos) {
        return [null, 'Infelizmente ocorreu um erro ao ler os vídeos dessa playlist do YouTube aa'];
    }

    return [videos.slice(0, playlistLimit), null];
}

module.exports = { searchTrack, searchYoutube, playlistLimit };
