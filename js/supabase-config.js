/* =========================================
   GROVE SANDBOX — SUPABASE CONFIGURATION
   Public browser credentials only.
========================================= */

const GROVE_SUPABASE_URL =
  "https://fpkrvgcpbnrusbfmhinj.supabase.co";

const GROVE_SUPABASE_KEY =
  "PASTE_YOUR_ANON_KEY_HERE";

/* Create the shared Supabase browser client. */
const groveSupabase = window.supabase.createClient(
  GROVE_SUPABASE_URL,
  GROVE_SUPABASE_KEY
);
