// Supabase client.
//
// Auth here is a gate at launch, never a per-action check. The tagger has to keep
// working at a field with no signal, so:
//   - the session is persisted and auto-refreshed, and a cached session is trusted
//     offline rather than re-validated,
//   - nothing in the tagging or export path awaits this module,
//   - if the project is not configured the app still runs; isConfigured is false and
//     the caller skips the login gate rather than dead-ending.
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = Boolean(url && anonKey);

export const supabase = isConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,      // survives app launches; no re-login between innings
        autoRefreshToken: true,
        // Email confirmation is on, so the link Supabase mails back lands here with
        // tokens in the URL fragment. This has to be true or that redirect is
        // ignored and the confirmed user still sees the sign-in screen.
        detectSessionInUrl: true,
        storageKey: 'loophohl.auth',
      },
    })
  : null;

// Read the cached session without going to the network. Used at startup so a dugout
// with no signal still lets the scorer straight through.
export async function getCachedSession() {
  if (!supabase) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session || null;
  } catch {
    return null;
  }
}
