import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser-side Supabase client. Safe to call from any 'use client'
 * component or hook — this is the client Realtime subscriptions need,
 * as opposed to the server client you'd use in Server Components/Actions.
 *
 * Requires these in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL=...
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
 *
 * (Newer Supabase projects sometimes label the second one
 * NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY instead — same purpose, just
 * rename the env var reference below to match if that's what you have.)
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}