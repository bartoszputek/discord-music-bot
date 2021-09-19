import winston from 'winston';

const {
  combine, timestamp, prettyPrint, simple,
} = winston.format;

const timezone = () => new Date().toLocaleString('en-US', {
  timeZone: 'Europe/Warsaw',
});

const logger = winston.createLogger({
  format: combine(
    timestamp({ format: timezone }),
    prettyPrint(),
  ),
  transports: [
    new winston.transports.File({ filename: 'logs.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: simple(),
  }));
}

export default logger;
