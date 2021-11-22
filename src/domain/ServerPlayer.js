class ServerPlayer {

    constructor() {
        this.playlist = [];
        this.currentAudioPlayer = null;
        this.currentSongIndex = 0;
    }

    addToPlaylist(playlistEntry) {
        return this.playlist.push(playlistEntry);
    }

    addToPlaylistNext(playlistEntry) {
        return this.playlist.splice(this.currentSongIndex + 1, 0, playlistEntry);
    }

    getCurrentEntry() {
        return this.playlist[this.currentSongIndex];
    }

    playlistHasEnded() {
        return this.currentSongIndex >= this.playlist.length;
    }
}

module.exports = ServerPlayer;
