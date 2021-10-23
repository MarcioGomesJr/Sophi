class ServerPlayer {

    constructor() {
        this.playlist = [];
        this.currentAudioPlayer = null;
        this.currentSongIndex = 0;
    }

    getCurrentEntry() {
        return this.playlist[this.currentSongIndex];
    }

    playlistHasEnded() {
        return this.currentSongIndex >= this.playlist.length;
    }
}

module.exports = ServerPlayer;
