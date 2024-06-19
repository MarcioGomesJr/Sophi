const { Message } = require('discord.js');
const {YouTubeVideo} = require('play-dl');

class PlaylistEntry {
    /**
     *
     * @param {Message} message
     * @param {YouTubeVideo} ytInfo
     */
    constructor(message, ytInfo) {
        /**
         * @type {Message}
         */
        this.message = message;

        /**
         * @type {YouTubeVideo}
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
