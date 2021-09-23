import winston from 'winston';
import dotenv from 'dotenv';

dotenv.config();

const {
  combine, timestamp, prettyPrint, simple, errors,
} = winston.format;

const timezone = () => new Date().toLocaleString('en-US', {
  timeZone: 'Europe/Warsaw',
});

const logger = winston.createLogger({
  format: combine(
    errors({ stack: true }),
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
