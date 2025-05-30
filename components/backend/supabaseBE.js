import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'URL_KEY';
const SUPABASE_ANON_KEY = 'API_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
