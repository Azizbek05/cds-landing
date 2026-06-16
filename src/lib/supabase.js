import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://tytdhdddnfitrenovsob.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5dGRoZGRkbmZpdHJlbm92c29iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5ODI0NTgsImV4cCI6MjA2NTU1ODQ1OH0.sb_publishable_195vYF0dQyHHXi5q2v9bvQ_WRD4KWtF'
)