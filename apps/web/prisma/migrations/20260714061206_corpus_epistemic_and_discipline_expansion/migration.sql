-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EpistemicStatus" ADD VALUE 'evidence';
ALTER TYPE "EpistemicStatus" ADD VALUE 'theory';
ALTER TYPE "EpistemicStatus" ADD VALUE 'observation';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Tradition" ADD VALUE 'astronomy';
ALTER TYPE "Tradition" ADD VALUE 'philosophy';
ALTER TYPE "Tradition" ADD VALUE 'psychology';
ALTER TYPE "Tradition" ADD VALUE 'mythology';
ALTER TYPE "Tradition" ADD VALUE 'design';
ALTER TYPE "Tradition" ADD VALUE 'methodology';
