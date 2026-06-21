// Create a free project at supabase.com then paste credentials here.
// Project Settings → API → Project URL + anon/public key
export const SUPABASE_URL      = 'https://YOUR_PROJECT.supabase.co';
export const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

export const SUPABASE_CONFIGURED =
  !SUPABASE_URL.includes('YOUR_PROJECT') &&
  !SUPABASE_ANON_KEY.includes('YOUR_ANON_KEY');
