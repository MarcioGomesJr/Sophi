/*
    Classe para representar comandos do bot. A função shouldExecute recebe a mensagem e o conteúdo normalizado
    (sem o prefixo e tudo em caixa baixa) e retorna true e o texto que será usado como argumento para o comando
    caso o comando deva ser executado, e retorna false e '' caso não deva.
    A função execute recebe a mensagem, argumento retornado pelo shouldExecute, e os detalhes de execução
    do servidor (playlist, currentAudioPlayer, etc).
    requireInVoice indica se o commando exige que o usuário esteja em um canal de voz para usá-lo.
*/

class Command {
    constructor(shouldExecute, execute, requireInVoice = true) {
        this.shouldExecute = shouldExecute;
        this.execute = execute;
        this.requireInVoice = requireInVoice;
    }
}

module.exports = Command;
