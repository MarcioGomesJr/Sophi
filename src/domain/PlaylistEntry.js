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
}

module.exports = PlaylistEntry;
