class PlaylistEntry {

    constructor(message, ytInfo) {
        this.message = message;
        this.ytInfo = ytInfo;
        this.stopRadin = false;
        this.originalVoiceChannelId = message.member.voice.channel.id;
    }

    clone() {
        return new PlaylistEntry(this.message, this.ytInfo);
    }
}

module.exports = PlaylistEntry;
