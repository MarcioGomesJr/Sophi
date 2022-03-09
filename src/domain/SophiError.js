class SophiError extends Error {
    constructor(message) {
        super(message);
        this.name = "SophiError";
    }
}

module.exports = SophiError;
