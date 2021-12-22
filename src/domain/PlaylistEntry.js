class PlaylistEntry {

    constructor(message, ytInfo) {
        this.message = message;
        this.ytInfo = ytInfo;
        this.stopRadin = false;
    }

    clone() {
        return new PlaylistEntry(this.message, this.ytInfo);
    }
}

module.exports = PlaylistEntry;
