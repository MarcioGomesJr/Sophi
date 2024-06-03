const { Client, GatewayIntentBits } = require('discord.js');
const { spotify_client_id, spotify_client_secret } = require('../token');
const SpotifyWebApi = require('spotify-web-api-node');
const logger = require('../util/logger');

const discordClient = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
    ],
    partials: ['CHANNEL', 'MESSAGE'],
});

/**
 * @type {SpotifyWebApi?}
 */
let spotifyClient = null;
/**
 * @type {number?}
 */
let expiresIn = null;
/**
 * @type {Date?}
 */
let credentialGrantedOn = null;

/**
 *
 * @param {SpotifyWebApi} spotifyClient
 * @returns {Promise<SpotifyWebApi>}
 */
async function fillAuthData(spotifyClient) {
    try {
        const data = await spotifyClient.clientCredentialsGrant();
        const { access_token: token, expires_in } = data.body;
        expiresIn = expires_in;
        credentialGrantedOn = new Date();

        logger.info('Token do spotify atualizado');
        spotifyClient.setAccessToken(token);
        return spotifyClient;
    } catch (error) {
        logger.error('Erro ao atualizar token do spotify', error);

        throw error;
    }
}

module.exports = {
    /**
     *
     * @returns {Client}
     */
    getClient() {
        return discordClient;
    },

    /**
     *
     * @returns {Promise<SpotifyWebApi?>}
     */
    getSpotifyClient() {
        if (!spotifyClient) {
            if (spotify_client_id && spotify_client_secret) {
                spotifyClient = new SpotifyWebApi({
                    clientId: spotify_client_id,
                    clientSecret: spotify_client_secret,
                });

                return fillAuthData(spotifyClient);
            } else {
                return Promise.resolve(null);
            }
        }

        const timeDifference = (new Date().getTime() - credentialGrantedOn.getTime()) / 1000;

        if (timeDifference >= expiresIn - 100) {
            return fillAuthData(spotifyClient);
        } else {
            return Promise.resolve(spotifyClient);
        }
    },
};
