import { createClient } from '@supabase/supabase-js';

// Note: Run this script with: node --env-file=.env tmp/check_providers.js

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: missing Supabase credentials in .env file');
  console.log('Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or PUBLISHABLE_KEY) are set.');
  process.exit(1);
}


const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('Fetching schema from providers table...');
  const { data, error } = await supabase.from('providers').select('*').limit(1);
  if (error) {
    console.error('Database Error:', error.message);
  } else if (data && data.length > 0) {
    console.log('Successfully fetched sample record.');
    console.log('Columns found:', Object.keys(data[0]));
  } else {
    console.log('Connected, but the providers table is empty.');
  }
}

checkSchema();

