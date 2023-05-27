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
         * @type {string}
         */
        this.originalVoiceChannelId = message.member.voice.channel.id;
    }

    /**
     * 
     * @returns {PlaylistEntry}
     */
    clone() {
        return new PlaylistEntry(this.message, this.ytInfo);
    }
}

module.exports = PlaylistEntry;
