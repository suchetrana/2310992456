import dotenv from 'dotenv'
dotenv.config();
type ServerConfig = {
    PORT: number
}
type DBConfig = {
    DB_USER: string,
    DB_PASSWORD: string,
    DB_HOST: string,
    DB_NAME: string
}
export const serverConfig:ServerConfig = {
    PORT: Number(process.env.PORT) || 3000
}

export const dbConfig:DBConfig = {
    DB_USER: process.env.DB_USER || 'root',
    DB_PASSWORD: process.env.DB_PASSWORD || 'password',
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_NAME: process.env.DB_NAME || 'test_db'
}