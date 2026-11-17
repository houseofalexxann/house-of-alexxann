-- AlterTable
ALTER TABLE "BirthProfile" ADD COLUMN     "isSelf" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "BirthProfile_userId_idx" ON "BirthProfile"("userId");

-- Until now each account was meant to keep exactly one profile: its own.
-- Every existing row therefore starts as "own" (the column default), and so
-- does any row the previous code writes while this deploy is in flight.
-- Where an account already holds more than one row, only the most recent
-- stays its own (that is the one every page was already reading); the
-- older ones become charts kept for someone else. Rows that belong to no
-- account are nobody's own chart.
UPDATE "BirthProfile" bp
SET "isSelf" = false
WHERE bp."userId" IS NULL
   OR bp."id" <> (
    SELECT b2."id"
    FROM "BirthProfile" b2
    WHERE b2."userId" = bp."userId"
    ORDER BY b2."createdAt" DESC, b2."id" DESC
    LIMIT 1
  );

-- The old save had no guard against two quick casts writing two identical
-- rows. Where a demoted row is an exact copy of the account's own chart
-- (same name, date, time and place), it is the same person twice, not a
-- chart kept for someone else: remove the copy.
DELETE FROM "BirthProfile" dup
USING "BirthProfile" own
WHERE dup."userId" IS NOT NULL
  AND dup."userId" = own."userId"
  AND dup."isSelf" = false
  AND own."isSelf" = true
  AND lower(dup."name") = lower(own."name")
  AND dup."birthDate" = own."birthDate"
  AND dup."birthTime" IS NOT DISTINCT FROM own."birthTime"
  AND abs(dup."latitude" - own."latitude") < 0.01
  AND abs(dup."longitude" - own."longitude") < 0.01;
