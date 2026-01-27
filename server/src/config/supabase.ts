import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

// Admin client - bypasses RLS, used for server-side operations
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

// Create a client scoped to a specific user's JWT (for RLS-aware queries)
export function createUserClient(accessToken: string) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}
