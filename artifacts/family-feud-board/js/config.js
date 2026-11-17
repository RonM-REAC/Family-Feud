// ============================================================
// SUPABASE CONFIG – REPLACE THESE WITH YOUR PROJECT VALUES
// ============================================================
// 1. Go to https://supabase.com → create a free project
// 2. Project Settings → API → copy Project URL and anon public key
// 3. Paste them below

const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_PUBLIC_KEY';

// ============================================================
// DO NOT EDIT BELOW
// ============================================================
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
