const skip = require('./skip');
const pause = require('./pause');
const { play, playNext, playAgain } = require('./playSong');
const queue = require('./queue');
const move = require('./move');
const remove = require('./remove');
const clear = require('./clear');
const goto = require('./goto');
const shuffle = require('./shuffle');
const playHere = require('./playHere');
const { search, searchNext } = require('./searchSong');

const allCommands = [
    pause,
    play,
    playNext,
    playAgain,
    skip,
    queue,
    move,
    remove,
    clear,
    goto,
    shuffle,
    search,
    searchNext,
    playHere,
];

module.exports = allCommands;
