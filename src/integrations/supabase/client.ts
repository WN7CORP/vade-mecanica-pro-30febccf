// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://phzcazcyjhlmdchcjagy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoemNhemN5amhsbWRjaGNqYWd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5MTM3NzUsImV4cCI6MjA2MDQ4OTc3NX0.oTdOS5KBBHROGkzcyr7-EZJNFvYzkGaBFT3F89YGrZg";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);