/**
 * Normalize a pasted database URL, forgiving the common copy/paste mistakes:
 * surrounding quotes (straight or smart), a leading `psql ` command prefix, a
 * `DATABASE_URL=` prefix, angle brackets, backticks, a BOM / zero-width
 * character, and stray whitespace. Shared by the runtime client, the Prisma
 * migrate config, and the deploy preflight so a slightly-messy paste in
 * Vercel still deploys cleanly.
 */
export function normalizeDbUrl(raw) {
  let s = (raw ?? "").toString();
  // Drop a BOM and zero-width characters anywhere.
  s = s.replace(/[﻿​‌‍⁠]/g, "");
  s = s.trim();
  // Strip leading command / key prefixes.
  s = s.replace(/^psql\s+/i, "");
  s = s.replace(/^DATABASE_URL\s*=\s*/i, "");
  // Strip wrapping quotes (straight or smart), backticks, angle brackets.
  s = s.replace(/^[`'"“”‘’<]+/, "").replace(/[`'"“”‘’>]+$/, "");
  s = s.trim();
  // Catch-all: if the scheme is buried behind stray leading characters, slice
  // from the first real postgres:// (or postgresql://) occurrence.
  if (!/^postgres/i.test(s)) {
    const m = s.match(/postgres(?:ql)?:\/\//i);
    if (m && m.index !== undefined) s = s.slice(m.index);
  }
  return s.trim();
}

/** A password-safe preview of a value for build logs: scheme area + length. */
export function redactDbUrl(raw) {
  const s = (raw ?? "").toString();
  const head = s.slice(0, 12);
  const codes = [...s.slice(0, 3)].map((c) => c.charCodeAt(0)).join(",");
  return `length=${s.length}, starts-with=${JSON.stringify(head)} (first char codes: ${codes})`;
}
