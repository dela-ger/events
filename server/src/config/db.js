import dotenv from 'dotenv';
dotenv.config();
import { Pool } from 'pg';


export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

export async function query(text, params) {
    const res = await pool.query(text, params);
    return res;
}

console.log('DATABASE_URL:', process.env.DATABASE_URL);