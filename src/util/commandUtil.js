module.exports = {
    /**
     * 
     * @param {string} normalizedMessage
     * @param {string[]} commandNames
     * @returns {[boolean, string]}
     */
    messageIsCommand(normalizedMessage, commandNames) {
        return [ commandNames.some(name => normalizedMessage === name), '' ];
    },
    
    /**
     * 
     * @param {string} normalizedMessage
     * @param {string[]} commandNames
     * @returns {[boolean, string]}
     */
    messageStartsWithCommand(normalizedMessage, commandNames) {
        const match = new RegExp(`^(${commandNames.join('|')}) (.+)$`, 'gi').exec(normalizedMessage);
        if (match) {
            return [ true, match[2].trim() ];
        }
        return [ false, '' ];
    },
}