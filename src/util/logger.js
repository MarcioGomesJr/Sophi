const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');
const { combine, timestamp, label, printf, errors } = format;
const path = require('path');

const logDirectory = path.resolve(__dirname, '..', '..', 'logs');

const myFormat = printf(({ level, message, label, timestamp, stack }) => {
    const stackMessage = stack ? `: ${stack}` : '';
    return `${timestamp} [${label}] ${level}: ${message}${stackMessage}`;
});

const logger = createLogger({
    level: 'info',
    format: combine(label({ label: 'sophi' }), timestamp(), errors({ stack: true }), myFormat),
    transports: [
        new transports.Console(),
        new transports.DailyRotateFile({
            filename: path.join(logDirectory, 'sophi-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxFiles: '14d',
        }),
    ],
});

module.exports = logger;
