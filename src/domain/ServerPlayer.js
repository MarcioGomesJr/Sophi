const radin = require('../player');

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

    removeFromPlaylist(index) {
        this.checkValidIndex(index);
        const removed = this.playlist.splice(index, 1);

        if (index <= this.currentSongIndex) {
            this.currentSongIndex--;
        }

        return removed[0];
    }

    getCurrentEntry() {
        return this.playlist[this.currentSongIndex];
    }

    playlistHasEnded() {
        return this.currentSongIndex >= this.playlist.length;
    }

    skipToSong(index=-1, sendMessage=true) {
        if (index === -1) {
            index = this.currentSongIndex + 1;
        } else {
            this.checkValidIndex(index);
        }

        this.getCurrentEntry().stopRadin = true;
        this.currentAudioPlayer.stop();

        this.currentSongIndex = index;
        if (!this.playlistHasEnded()) {
            radin(this, sendMessage);
        }
    }

    checkValidIndex(index) {
        if (index < 0 || index >= this.playlist.length) {
            throw new Error(`Índice ${index + 1} inválido! Veja a playlist para saber quais podem ser usados :P`);
        }
    }

    move(from, to) {
        this.checkValidIndex(from);
        this.checkValidIndex(to);
        if (from == to) {
            throw new Error('Os índices são iguais aa');
        }

        const temp = this.playlist[from];
        this.playlist[from] = this.playlist[to];
        this.playlist[to] = temp;
    }

    playerStatus() {
        return this.currentAudioPlayer?.state?.status;
    }

    notPlayingOrPaused() {
        return this.playerStatus() != 'paused' && this.playerStatus() != 'playing';
    }
}

module.exports = ServerPlayer;
