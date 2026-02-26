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

/**
 * Run auto-migrations on server startup.
 * Checks if columns exist via a test select. If missing, tries multiple
 * Supabase endpoints to execute the ALTER TABLE DDL.
 */
export async function runMigrations() {
  const needed: { table: string; column: string; sql: string }[] = [
    {
      table: 'inbox_messages',
      column: 'scheduled_at',
      sql: 'ALTER TABLE inbox_messages ADD COLUMN IF NOT EXISTS scheduled_at timestamptz DEFAULT NULL',
    },
  ];

  for (const m of needed) {
    const { error } = await supabaseAdmin.from(m.table).select(m.column).limit(0);

    if (error && error.message.includes(m.column)) {
      console.log(`[Migration] ${m.table}.${m.column} missing — adding…`);
      const ok = await execSupabaseSql(m.sql);
      if (ok) {
        console.log(`[Migration] ${m.table}.${m.column} created successfully`);
      } else {
        console.warn(`[Migration] Auto-migration failed. Run this in Supabase SQL Editor:`);
        console.warn(`  ${m.sql};`);
      }
    } else {
      console.log(`[Migration] ${m.table}.${m.column} OK`);
    }
  }
}

/**
 * Execute raw SQL against Supabase Postgres.
 * Tries multiple approaches in order.
 */
export async function execSupabaseSql(sql: string): Promise<boolean> {
  const projectRef = env.SUPABASE_URL.match(/https?:\/\/([^.]+)/)?.[1];
  if (!projectRef) return false;

  // Attempt 1 — existing run_sql / exec_sql RPC functions
  for (const fn of ['run_sql', 'exec_sql']) {
    try {
      const { error } = await supabaseAdmin.rpc(fn, { query: sql });
      if (!error) return true;
    } catch { /* function may not exist */ }
  }

  // Attempt 2 — Supabase pg/query HTTP endpoint
  try {
    const res = await fetch(`https://${projectRef}.supabase.co/pg/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: sql }),
    });
    if (res.ok) return true;
  } catch { /* endpoint may not exist */ }

  return false;
}
