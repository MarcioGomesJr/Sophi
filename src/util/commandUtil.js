module.exports = {
    messageIsCommand(normalizedMessage, commandNames) {
        return [ commandNames.some(name => normalizedMessage == name), '' ];
    },
    
    messageStartsWithCommand(normalizedMessage, commandNames) {
        const match = new RegExp(`^(${commandNames.join('|')}) (.+)$`, 'gi').exec(normalizedMessage);
        if (match) {
            return [ true, match[2].trim() ];
        }
        return [ false, '' ];
    },
}