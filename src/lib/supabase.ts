
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://phzcazcyjhlmdchcjagy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoemNhemN5amhsbWRjaGNqYWd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5MTM3NzUsImV4cCI6MjA2MDQ4OTc3NX0.oTdOS5KBBHROGkzcyr7-EZJNFvYzkGaBFT3F89YGrZg'
);
