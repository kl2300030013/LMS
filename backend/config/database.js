import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Only create Supabase client if environment variables are properly configured
let supabase = null;

if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http')) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client initialized successfully');
  } catch (error) {
    console.warn('⚠️ Failed to initialize Supabase client:', error.message);
  }
} else {
  console.warn('⚠️ Supabase configuration missing or invalid. Database features will be disabled.');
  console.log('To enable database features, please configure SUPABASE_URL and SUPABASE_ANON_KEY in your .env file.');
}

export { supabase };

// Test connection
export const testConnection = async () => {
  if (!supabase) {
    console.log('⚠️ Supabase not configured - skipping connection test');
    return false;
  }
  
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) throw error;
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.warn('⚠️ Database connection failed:', error.message);
    return false;
  }
};