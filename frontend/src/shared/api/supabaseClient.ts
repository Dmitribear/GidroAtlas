import { createClient } from '@supabase/supabase-js'

const url = "https://njxfddnwjgreejuuqdrs.supabase.co"
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qeGZkZG53amdyZWVqdXVxZHJzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDkyNjUzNCwiZXhwIjoyMDgwNTAyNTM0fQ.6woafEjE0nscxV6VWBvagQ2T83P3lQdVwplVh_EPUYM"


if (!url || !anonKey) {
  console.warn('Supabase env variables are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(url ?? '', anonKey ?? '')
