
// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';

import { MongoClient } from 'mongodb';
import { fs } from 'mz';
import { resolve as resolvePath } from 'path';
import { logger } from './logger';
/**
 * This is an application entrypoint
 */

const gracefulExitSignals: ('SIGABRT' | 'SIGALRM' | 'SIGHUP' | 'SIGINT' | 'SIGTERM')[] =
  ['SIGABRT', 'SIGALRM', 'SIGHUP', 'SIGINT', 'SIGTERM'];

(async () => {
  const database = 'mongo-workshop';
  const mongoURL = `mongodb+srv://workshoper:<yourpasswordhere>@mongodbworkshop-eyt5f.mongodb.net/${database}?retryWrites=true&w=majority`;
  const client = await MongoClient.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });
  const db = client.db(database);
  const result = await db.collection('orders').aggregate(
  [
    // Your pipeline goes here
    { $limit: 1 }
  ]
  ).toArray();
  await savePipelineResult(result);
  console.log(JSON.stringify(result, undefined, 2));

  logger.info('Done!');
  for (const signal of gracefulExitSignals) {
    process.on(signal, async () => {
      logger.debug(`Got signal [${signal}], exiting..`);
      await client.close();
      process.exit(0);
    });
  }
})().catch((error: Error) =>
  logger.error(`Oops, we've got an error: ${JSON.stringify(error.stack)}`)
);

async function savePipelineResult(result: any[], filePath: string = '../pipelineOutput.json'): Promise<void> {
  await fs.writeFile(resolvePath(__dirname, filePath), JSON.stringify(result, undefined, 2));
}
