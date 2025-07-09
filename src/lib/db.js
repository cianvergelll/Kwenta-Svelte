import mysql from "mysql2/promise";
import dotenv from "dotenv";


dotenv.config();

export const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kwenta_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 10,
    dateStrings: true,
    // ssl: {
    //     rejectUnauthorized: false
    // }
});