import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://tytdhdddnfitrenovsob.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5dGRoZGRkbmZpdHJlbm92c29iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MDgxOTAsImV4cCI6MjA5NzA4NDE5MH0.MaPln0rmAnyBmwaK7sEvlIIYVwbEiMqBMxXh6VDc6og'
)