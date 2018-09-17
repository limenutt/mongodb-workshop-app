/**
 * Logger
 */
import { createLogger, format, Logger as WinstonLogger, transports } from 'winston';
export const logger = createLogger(
  {
    level: 'debug',
    transports: [
      new transports.Console({
        format: format.combine(
          format.colorize(),
          format.simple()
        )
      })
    ]
  }
);
