import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://ggkdllzsksxqqliyzwrl.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdna2RsbHpza3N4cXFsaXl6d3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MjA5MTAsImV4cCI6MjA3OTk5NjkxMH0.Y6uPGhhxoZfLsSL4lgwCwaxgfzNR6Eoo1ALcDscYxSc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
