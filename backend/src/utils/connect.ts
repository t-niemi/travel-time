import { Pool, QueryResultRow } from "pg";
import config from "./config";

class Database {
  pool: Pool;
  //client: PoolClient | undefined;

  constructor() {
    this.pool = new Pool({
      host: config.DB_HOST,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
      database: config.DB_NAME,
      port: config.DB_PORT,
      ssl: config.SSL,
    });

    // Optional: Log when connection to the database is established
    this.pool.on("connect", () => {
      console.log("Connected to the PostgreSQL database");
    });

    // Optional: Log any errors with the database connection
    this.pool.on("error", (err) => {
      console.error("Unexpected error on idle client", err);
      process.exit(-1);
    });
  }

  async query<Type extends QueryResultRow>(text: string, params: string[]) {
    const client = await this.pool.connect();
    const res = await client.query<Type>(text, params);
    client.release();
    //await this.close();
    return res;
  }

  async close() {
    await this.pool.end();
    console.log("Closed database connection");
  }
}

export default new Database();
