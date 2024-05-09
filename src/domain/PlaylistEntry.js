const { Message } = require('discord.js');
const playdl = require('play-dl');

class PlaylistEntry {

    /**
     * 
     * @param {Message} message
     * @param {playdl.YouTubeVideo} ytInfo
     */
    constructor(message, ytInfo) {
        /**
         * @type {Message}
         */
        this.message = message;

        /**
         * @type {playdl.YouTubeVideo}
         */
        this.ytInfo = ytInfo;

        /**
         * @type {boolean}
         */
        this.stopRadin = false;

        /**
         * @type {string | undefined}
         */
        this.originalVoiceChannelId = message.member?.voice.channel?.id;
    }

    /**
     * 
     * @returns {PlaylistEntry}
     */
    clone() {
        const cloned = new PlaylistEntry(this.message, this.ytInfo);
        cloned.originalVoiceChannelId = this.originalVoiceChannelId;

        return cloned;
    }
}

module.exports = PlaylistEntry;
