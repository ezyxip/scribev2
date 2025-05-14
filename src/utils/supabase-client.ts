import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  "https://qowrykjgyicupohhesuv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvd3J5a2pneWljdXBvaGhlc3V2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjAyNDYyNSwiZXhwIjoyMDYxNjAwNjI1fQ.TWI9IcbzHOtxXff9UluvFCX8yADiiSKoPbRXrEe_ReQ"
)

supabase.auth.signInAnonymously();