/**
 * Constant-time string comparison that cannot throw. Both sides are hashed
 * to a fixed length first, so values of different lengths (including a
 * cookie whose character count matches but whose byte count does not) are
 * simply unequal, never an error.
 */
import { createHash, timingSafeEqual } from "node:crypto";

export function safeEqual(a: string, b: string): boolean {
  const da = createHash("sha256").update(a).digest();
  const db = createHash("sha256").update(b).digest();
  return timingSafeEqual(da, db);
}
