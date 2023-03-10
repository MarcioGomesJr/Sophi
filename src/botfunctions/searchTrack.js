const playdl = require('play-dl');
const ytdl = require('ytdl-core');
const SophiError = require('../domain/SophiError');
const { getSpotifyClient } = require('../util/clientManager');

// TODO Implementar limitação da duração dos vídeos e pesquisa
async function searchTrack(searchTerm) {
    if (searchTerm.startsWith('https')) {

        if (/^(spotify:|https:\/\/[a-z]+\.spotify\.com\/)/.test(searchTerm)) {
            const spotifyClient = await getSpotifyClient();
            if (spotifyClient) {
                return searchSpotify(searchTerm, spotifyClient);
            } else {
                return [null, 'Infelizmente só consigo reproduzir links do YouTube no momento =x'];
            }
        }
        if (playdl.yt_validate(searchTerm) === false && !ytdl.validateURL(searchTerm)) {
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

async function searchSpotify(spotifyLink, spotifyClient) {
    try {
        const id = spotifyLink.split('/').pop();
        if (spotifyLink.includes('/playlist')) {
            const playlistData = await spotifyClient.getPlaylist(id, { limit: 50, offset: 0 });
    
            if (!playlistData) {
                return [null, 'Esse não parece um link válido de uma playlist do spotify a'];
            }
    
            const ids = playlistData.body.tracks.items.map(it => it.track.id);
            const tracks = await getTracksFromSpotifyIdList(ids, spotifyClient);
    
            return [tracks, null];
        } else if (spotifyLink.includes('/album')) {
            const albumData = await spotifyClient.getAlbumTracks(id, { limit: 50, offset: 0 });
    
            if (!albumData) {
                return [null, 'Esse não parece um link válido de um álbum spotify a'];
            }
    
            const ids = albumData.body.tracks.items.map(it => it.id);
            const tracks = await getTracksFromSpotifyIdList(ids, spotifyClient);
    
            return [tracks, null];
        } else {
            return searchSpotifyTrack(id, spotifyClient);
        }
    } catch (e) {
        console.log('Erro ao buscar música pelo link do spotify: ' + spotifyLink, e);
        return [null, 'Esse não parece ser um link válido do spotify =x'];
    }
}

async function getTracksFromSpotifyIdList(spotifyIdList, spotifyClient) {
    return Promise.all(
        spotifyIdList.map(async (id) => {
            const trackInfo = await searchSpotifyTrack(id, spotifyClient);
            return trackInfo[0][0];
        })
    );
}

async function searchSpotifyTrack(trackId, spotifyClient) {
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

module.exports = searchTrack;
