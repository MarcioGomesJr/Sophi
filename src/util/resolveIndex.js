
module.exports = (indexS, serverPlayer) => {
    if (indexS === 'first') {
        return 0;
    }
    if (indexS === 'previous') {
        return serverPlayer.currentSongIndex - 1;
    }
    if (indexS === 'this') {
        return serverPlayer.currentSongIndex;
    }
    if (indexS === 'next') {
        return serverPlayer.currentSongIndex + 1;
    }
    if (indexS === 'last') {
        return serverPlayer.playlist.length;
    }
    return Number(indexS) - 1;
}
