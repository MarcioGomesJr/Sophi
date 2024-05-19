const { Message } = require('discord.js');
const ServerPlayer = require('../domain/ServerPlayer');

/*
    Classe para representar comandos do bot. A função shouldExecute recebe a mensagem e o conteúdo normalizado
    (sem o prefixo e tudo em caixa baixa) e retorna true e o texto que será usado como argumento para o comando
    caso o comando deva ser executado, e retorna false e '' caso não deva.
    A função execute recebe a mensagem, argumento retornado pelo shouldExecute, e os detalhes de execução
    do servidor (playlist, audioPlayer, etc).
    requireInVoice indica se o commando exige que o usuário esteja em um canal de voz para usá-lo.
*/

class Command {
    /**
     *
     * @param {(message: Message, normalizedMessage: string) => [boolean, string]} shouldExecute
     * @param {(message: Message, argument: string, serverPlayer: ServerPlayer) => Promise<void>} execute
     * @param {boolean} requireInVoice
     */
    constructor(shouldExecute, execute, requireInVoice = true) {
        /**
         * @type {(message: Message, normalizedMessage: string) => [boolean, string]}
         */
        this.shouldExecute = shouldExecute;

        /**
         * @type {(message: Message, argument: string, serverPlayer: ServerPlayer) => Promise<any>}
         */
        this.execute = execute;

        /**
         * @type {boolean}
         */
        this.requireInVoice = requireInVoice;
    }
}

module.exports = Command;
