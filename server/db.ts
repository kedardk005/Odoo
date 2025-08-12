import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
  throw new Error(
    "DATABASE_URL or DB_HOST must be set. Did you forget to configure the database?",
  );
}

const connectionConfig = process.env.DATABASE_URL 
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'rental_management',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    };

export const pool = new Pool(connectionConfig);
export const db = drizzle({ client: pool, schema });