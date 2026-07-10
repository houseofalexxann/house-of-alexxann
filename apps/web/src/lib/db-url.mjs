/**
 * Normalize a pasted database URL, forgiving the common copy/paste mistakes:
 * surrounding quotes, a leading `psql ` command prefix, a `DATABASE_URL=`
 * prefix, and stray whitespace. Shared by the runtime client, the Prisma
 * migrate config, and the deploy preflight so a slightly-messy paste in
 * Vercel still deploys cleanly.
 */
export function normalizeDbUrl(raw) {
  let s = (raw ?? "").trim();
  // Strip a leading `psql ` (Neon's "connect with psql" copy form).
  s = s.replace(/^psql\s+/i, "");
  // Strip a leading `DATABASE_URL=` (copied from a .env line).
  s = s.replace(/^DATABASE_URL\s*=\s*/i, "");
  // Strip one layer of matching surrounding quotes.
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1);
  }
  return s.trim();
}
