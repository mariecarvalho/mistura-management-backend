import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      // Descarta conexões ociosas antes que o provedor as derrube
      idleTimeoutMillis: 30000,
    })
  : new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: Number(process.env.DB_PORT),
    });

pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database');
});

// Sem este tratador, uma conexão ociosa derrubada pelo provedor encerraria o processo
pool.on('error', (err) => {
  console.error('Erro em conexão ociosa do pool:', err.message);
});

export default pool;
