module.exports = async function pause(currentAudioPlayer, message) {

    if (message.content === '-p') {
        
        if (currentAudioPlayer['1'].state.status === 'paused') {
            currentAudioPlayer['1'].unpause();
            message.reply("It's dare U-U");
        }
        else {
            currentAudioPlayer['1'].pause();
            message.reply("PAUSO! O-o");
        }
    }
}
