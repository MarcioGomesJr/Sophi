const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf, errors } = format;

const myFormat = printf(({ level, message, label, timestamp, stack }) => {
    const stackMessage = stack ? `: ${stack}` : '';
    return `${timestamp} [${label}] ${level}: ${message}${stackMessage}`;
});

const logger = createLogger({
    level: 'info',
    format: combine(label({ label: 'sophi' }), errors({ stack: true }), timestamp(), myFormat),
    transports: [
        new transports.Console(),
        // new transports.File({
        //     filename: 'sophi.log',
        // }),
    ],
});

module.exports = logger;
