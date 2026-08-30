import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL;

async function setupDatabase() {
  if (!connectionString) {
    console.error('❌ DATABASE_URL is not set in .env file');
    process.exit(1);
  }
  
  console.log('🔌 Connecting to PostgreSQL Supabase database...');
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connected successfully!');
    
    console.log('📜 Reading database.sql...');
    const sqlPath = path.resolve('database.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('🧹 Cleaning up existing tables (if any)...');
    await client.query(`
      DROP TABLE IF EXISTS public.user_logs CASCADE;
      DROP TABLE IF EXISTS public.order_chats CASCADE;
      DROP TABLE IF EXISTS public.support_tickets CASCADE;
      DROP TABLE IF EXISTS public.orders CASCADE;
      DROP TABLE IF EXISTS public.products CASCADE;
      DROP TABLE IF EXISTS public.stores CASCADE;
      DROP TABLE IF EXISTS public.users CASCADE;
      
      -- Drop triggers and functions created in database.sql
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
      DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
    `);

    console.log('🏗️ Executing SQL script from database.sql (this may take a moment)...');
    
    // We wrap it in a transaction for safety if possible, but some statements like ALTER PUBLICATION might fail in a transaction.
    // So we just execute it directly.
    await client.query(sql);
    
    console.log('✅ Database successfully recreated from database.sql!');
    
    client.release();
    await pool.end();
  } catch (err) {
    console.error('❌ Setup failed:', err.message);
    console.log('\n💡 TIP: Local ISP/Firewall often blocks direct DB ports 5432 & 6543.');
    console.log('Please copy-paste the SQL script from database.sql directly into Supabase Dashboard SQL Editor!');
    process.exit(1);
  }
}

setupDatabase();
