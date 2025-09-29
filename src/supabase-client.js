// supabase-client.js
const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.__env;

const supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
