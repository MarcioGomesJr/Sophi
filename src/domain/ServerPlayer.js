class ServerPlayer {

    constructor() {
        this.playlist = [];
        this.currentAudioPlayer = null;
        this.currentSongIndex = 0;
    }

    getCurrentEntry() {
        return this.playlist[this.currentSongIndex];
    }
}

module.exports = ServerPlayer;
