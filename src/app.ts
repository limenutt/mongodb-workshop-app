// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';
import { logger } from './logger';
/**
 * This is an application entrypoint
 */
(async () => {
  logger.info('Hello world');
})().catch((error: Error) =>
  logger.error(`error during server start:${JSON.stringify(error.stack)}`)
);
