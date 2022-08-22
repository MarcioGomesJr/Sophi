const possibleIndexString = '(\d+|first|previous|this|next|last)';

module.exports = {
    resolveIndex: (indexS, serverPlayer) => {
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
            return serverPlayer.playlist.length - 1;
        }
        
        const index = Number(indexS);
        if (index < 0) {
            return serverPlayer.playlist.length - 1 - index;
        }
    
        return index - 1;
    },

    getIndexRegex: () => {
        return /^(\d+|first|previous|this|next|last)$/gi;
    },
    
    getTwoIndexesRegex: () => {
        return /^(\d+|first|previous|this|next|last) \s*(\d+|first|previous|this|next|last)$/gi;
    },
}
