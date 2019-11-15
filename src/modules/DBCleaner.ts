import { MongoClient, ObjectID } from 'mongodb';
import { fs } from 'mz';
import { resolve as resolvePath } from 'path';
import * as ProgressBar from 'progress';

export interface IDBConnection {
  mongoURL: string;
}
interface IDBCustomer {
  _id: ObjectID;
  firstName: string;
  email: string;
  lastName: string;
}
interface IDBUser {
  _id: ObjectID;
  firstName: string;
  email: string;
  lastName: string;
  username: string;
}
interface IRandomPerson {
  name: string;
  surname: string;
  email: string;
}
/**
 * Cleans up the database
 */
export class DBCleaner {
  private config: IDBConnection;
  constructor(config: IDBConnection) {
    this.config = config;
  }
  public async anonymiseUsers(): Promise<void> {
    let client: MongoClient | undefined;
    let progressBar: ProgressBar | undefined;
    try {
      const randomPeople = (await this.loadRandomNames()).reverse();
      client = await MongoClient.connect(this.config.mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });
      const perPage = 10;
      let skip = 0;
      const collection = client.db().collection('users');
      const query = collection.find();
      const total = await query.count();
      progressBar = new ProgressBar('Anonymising users [:bar] :current/:total ETA :etas', { total });
      let users: IDBUser[] = [];
      do {
        users = await client.db().collection('users').find().sort({ _id: 1 }).limit(perPage).skip(skip).toArray();
        await Promise.all(users.map(async (customer, i) => {
          const randomPerson = randomPeople[skip + i];
          const username = randomPerson.email.split('@')[0];

          return collection.updateOne(
            { _id: customer._id },
            {
              $set: {
                firstName: randomPerson.name,
                lastName: randomPerson.surname,
                email: randomPerson.email,
                username
              }
            });
        }));
        skip += perPage;
        progressBar.tick(users.length);
      } while (users.length > 0);
    } finally {
      if (client !== undefined) {
        await client.close();
      }
      if (progressBar !== undefined) {
        progressBar.terminate();
      }
    }
  }
  public async anonymiseCustomers(): Promise<void> {
    let client: MongoClient | undefined;
    let progressBar: ProgressBar | undefined;
    try {
      const randomPeople = await this.loadRandomNames();
      client = await MongoClient.connect(this.config.mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });
      const customerPage = 10;
      let skip = 0;
      const collection = client.db().collection('customers');
      const query = collection.find();
      const total = await query.count();
      progressBar = new ProgressBar('Anonymising customers [:bar] :current/:total ETA :etas', { total });
      let customers: IDBCustomer[] = [];
      do {
        customers = await client.db().collection('customers').find().sort({ _id: 1 }).limit(customerPage).skip(skip).toArray();
        await Promise.all(customers.map(async (customer, i) => {
          const randomPerson = randomPeople[skip + i];

          return collection.updateOne(
            { _id: customer._id },
            {
              $set: {
                firstName: randomPerson.name,
                lastName: randomPerson.surname,
                email: randomPerson.email
              }
            });
        }));
        skip += customerPage;
        progressBar.tick(customers.length);
      } while (customers.length > 0);
    } finally {
      if (client !== undefined) {
        await client.close();
      }
      if (progressBar !== undefined) {
        progressBar.terminate();
      }
    }
  }
  protected async loadRandomNames(): Promise<IRandomPerson[]> {
    const randomPeople: IRandomPerson[] = [];
    const filesToLoad = 14;
    const progressBar = new ProgressBar('Loading random people [:bar] ETA :etas', { total: filesToLoad });
    try {
      for (let i = 1; i <= filesToLoad; i += 1) {
        const fileName = resolvePath(__dirname, `../../data/random_people_${i}.json`);
        const contents = await fs.readFile(fileName, { encoding: 'utf8'});
        const parsedContents = (<IRandomPerson[]>JSON.parse(contents)).map(person => {
          // tslint:disable-next-line: insecure-random
          const r = Math.random().toString(36).substring(7);
          person.email = `${r}${person.email}`;

          return person;
        });

        randomPeople.push(...parsedContents);
        progressBar.tick(1);
      }
    } finally {
      progressBar.terminate();
    }

    return randomPeople;
  }
}
