import "dotenv/config";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;
const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432;
const SSL = process.env.SSL ? /true/.test(process.env.SSL) : false;

export default { PORT, DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT, SSL };
