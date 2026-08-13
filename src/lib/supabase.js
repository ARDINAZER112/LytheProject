import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zkywxhgcdkixufpxlnwi.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpreXd4aGdjZGtpeHVmcHhsbndpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2MjE2NzQsImV4cCI6MjEwMjE5NzY3NH0.zIojtnRz7Czej2Bus0Nh10eD-9t0pPgImgAjVWnJXrg';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
