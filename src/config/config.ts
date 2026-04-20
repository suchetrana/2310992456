import {dbConfig} from './index.js'
const Config = {
    development: {
      username: dbConfig.DB_USER,
      password: dbConfig.DB_PASSWORD,
      database: dbConfig.DB_NAME,
      host: dbConfig.DB_HOST,
      dialect: 'mysql',
    }
}