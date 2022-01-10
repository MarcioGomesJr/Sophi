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
            if (index === this.currentSongIndex + 1) {
                this.skipToSong();
            }
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
            if (this.playlistHasEnded()) {
                return;
            }
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
        if (from === this.currentSongIndex) {
            throw new Error(`Índice ${from + 1} inválido! Não se pode mover a música tocando agora :P`);
        }
        if (to < 0) {
            throw new Error(`Índice ${to + 1} inválido! Deve ser maior ou igual a um :P`);
        }
        if (to === this.currentSongIndex) {
            throw new Error(`Índice ${to + 1} inválido! Não se pode mover para a música tocando agora. Mova para next ou dê skip :P`);
        }
        if (to > this.playlist.length) {
            throw new Error(`Índice ${to + 1} inválido! Deve ser maior menor que o último da playlist ou next :P`);
        }
        if (from === to) {
            throw new Error('Os índices são iguais aa');
        }

        if (to === this.playlist.length) {
            const playlistEntry = this.removeFromPlaylist(from);
            this.addToPlaylist(playlistEntry.clone());
        }
        else {
            const temp = this.playlist[from];
            this.playlist[from] = this.playlist[to];
            this.playlist[to] = temp;
        }
    }

    playerStatus() {
        return this.currentAudioPlayer?.state?.status;
    }

    notPlayingOrPaused() {
        return this.playerStatus() != 'paused' && this.playerStatus() != 'playing';
    }

    clearPlaylist() {
        this.getCurrentEntry().stopRadin = true;
        this.playlist = [];
        this.currentAudioPlayer.stop();
    }
}

module.exports = ServerPlayer;
