const { Client, GatewayIntentBits } = require('discord.js');
const { spotify_client_id, spotify_client_secret } = require('../token');
const SpotifyWebApi = require('spotify-web-api-node');

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

let spotifyClient = null;
let expiresIn = null;
let credentialGrantedOn = null;

if (spotify_client_id && spotify_client_secret) {
    spotifyClient = new SpotifyWebApi({
        clientId: spotify_client_id,
        clientSecret: spotify_client_secret,
    });

    fillAuthData(spotifyClient);
}

function fillAuthData(spotifyClient) {
    return new Promise((resolve, reject) => {
        spotifyClient
            .clientCredentialsGrant()
            .then((data) => {
                const token = data.body['access_token'];
                expiresIn = data.body['expires_in'];
                credentialGrantedOn = new Date();
                console.log('Token do spotify atualizado:', token);
                spotifyClient.setAccessToken(token);
                resolve(spotifyClient);
            })
            .catch((error) => {
                console.log('Erro ao atualizar token do spotify:', error);
                reject(error);
            });
        });
}

module.exports = {
    getClient() {
        return discordClient;
    },
    getSpotifyClient() {
        if (!spotifyClient) {
            return Promise.resolve(null);
        }

        const timeDifference = (new Date().getTime() - credentialGrantedOn.getTime()) / 1000;
        console.log(timeDifference);
        console.log(expiresIn - 100);

        if (timeDifference >= expiresIn - 100) {
            return fillAuthData(spotifyClient);
        } else {
            return Promise.resolve(spotifyClient);
        }
    },
};
