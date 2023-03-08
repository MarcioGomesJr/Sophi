const { Client, GatewayIntentBits } = require('discord.js');
const { spotify_client_id, spotify_client_secret } = require('../token');
const SpotifyWebApi = require('spotify-web-api-node');

const client = new Client({
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

let spotifyClient = null;

if (spotify_client_id && spotify_client_secret) {
    spotifyClient = new SpotifyWebApi({
        clientId: spotify_client_id,
        clientSecret: spotify_client_secret,
    });

    spotifyClient
        .clientCredentialsGrant()
        .then((data) => {
            const token = data.body['access_token'];
            console.error('Token do spotify obtido:', token);
            spotifyClient.setAccessToken(token);
        })
        .catch((error) => {
            console.error('Erro ao obter token do spotify:', error);
        });
}

module.exports = {
    getClient() {
        return client;
    },
    getSpotifyClient() {
        return spotifyClient;
    },
};
