import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Set default schema to 'reporting' for every new connection
pool.on('connect', (client) => {
  client.query(`SET search_path TO ${process.env.DB_SCHEMA}, public`);
});

// Test connection on startup
export async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('Database connected successfully at', result.rows[0].now);
    client.release();
    return true;
  } catch (err) {
    console.error('Database connection failed:', err.message);
    return false;
  }
}

export default pool;
