module.exports = async function skip(currentAudioPlayer, message) {
    if (message.content.startsWith('-s')) {
        message.reply('Skiiiiiiiiiipooooo-desu vruuuuuuuuuuuuuuuuuuuuuuuuuuum!!!!');
        currentAudioPlayer['1'].stop();
    }
}
