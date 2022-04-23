const skip = require('./skip');
const pause = require('./pause');
const playSong = require('./playSong');
const queue = require('./queue');
const move = require('./move');
const remove = require('./remove');
const clear = require('./clear');
const goto = require('./goto');

const allCommands = [pause, ...playSong, skip, queue, move, remove, clear, goto];

module.exports = allCommands;
