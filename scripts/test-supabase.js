import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nggbfdsdpotszdhfldqk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nZ2JmZHNkcG90c3pkaGZsZHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5OTU5MTgsImV4cCI6MjEwMTU3MTkxOH0.H5UMmLyGaTzUtO6vdb5Hp_2tnPIJuNMFKZ_PJQH4GNE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseRest() {
  console.log('📡 Testing Supabase REST API connection using anon key...');
  const { data, error } = await supabase.from('products').select('*');
  
  if (error) {
    if (error.code === '42P01' || error.message.includes('does not exist')) {
      console.log('⚠️ Connected to Supabase REST API successfully, but the "products" table does not exist yet.');
      console.log('👉 Please paste the SQL script into Supabase SQL Editor to create the tables!');
    } else {
      console.error('❌ Supabase error:', error);
    }
  } else {
    console.log('🎉 SUCCESS! Connected to Supabase PostgreSQL database via HTTPS REST API!');
    console.log(`📦 Found ${data.length} products in database:`);
    console.dir(data, { depth: null });
  }
}

testSupabaseRest();
