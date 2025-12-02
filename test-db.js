const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env vars manually since we are running a standalone script
function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const env = {};
      content.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) env[key.trim()] = value.trim();
      });
      return env;
    } else {
      const envPath2 = path.resolve(process.cwd(), '.env');
      if (fs.existsSync(envPath2)) {
        const content = fs.readFileSync(envPath2, 'utf8');
        const env = {};
        content.split('\n').forEach(line => {
          const [key, value] = line.split('=');
          if (key && value) env[key.trim()] = value.trim();
        });
        return env;
      }
    }
  } catch (e) {
    console.error('Error loading .env.local', e);
  }
  return {};
}

const env = loadEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing connection to:', supabaseUrl);
  
  // Try to fetch listings
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching listings:', error);
  } else {
    console.log('Successfully fetched listings:', data);
  }
}

testConnection();
