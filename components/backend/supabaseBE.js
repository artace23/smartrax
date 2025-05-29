import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yiekjklwdtgfxggjmwub.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpZWtqa2x3ZHRnZnhnZ2ptd3ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY2NzEzNjksImV4cCI6MjA0MjI0NzM2OX0.OlmW6U3QY_Qgl9oRonYCftPpRV1s8uJio_ACuMmn6uk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);