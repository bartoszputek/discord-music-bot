import winston from 'winston';

const {
  combine, timestamp, errors, json,
} = winston.format;

const timezone = () => new Date().toLocaleString('en-US', {
  timeZone: 'Europe/Warsaw',
});

const logger = winston.createLogger({
  format: combine(
    errors({ stack: true }),
    timestamp({ format: timezone }),
    json(),
  ),
  transports: [new winston.transports.Console()],
  handleExceptions: true,
  handleRejections: true,
});

export default logger;
