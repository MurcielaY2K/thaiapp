// Create a free project at supabase.com then paste credentials here.
// Project Settings → API → Project URL + anon/public key
export const SUPABASE_URL      = 'https://utshlbvqwlojovnlnhxd.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0c2hsYnZxd2xvam92bmxuaHhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzNTc5OTUsImV4cCI6MjA5NzkzMzk5NX0.ONnNsAMfyVsImezJ1IhVzw9vEgo8N1LUw9AnMPsjJtE';

export const SUPABASE_CONFIGURED =
  !SUPABASE_URL.includes('YOUR_PROJECT') &&
  !SUPABASE_ANON_KEY.includes('YOUR_ANON_KEY');
