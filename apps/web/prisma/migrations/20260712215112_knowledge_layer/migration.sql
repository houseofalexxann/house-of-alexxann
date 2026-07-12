-- CreateEnum
CREATE TYPE "EpistemicStatus" AS ENUM ('doctrine', 'scholarship', 'synthesis', 'simplification', 'experimental');

-- CreateEnum
CREATE TYPE "SourceKind" AS ENUM ('primary', 'translation', 'scholarship', 'course', 'podcast', 'article');

-- CreateEnum
CREATE TYPE "RightsStatus" AS ENUM ('in_copyright', 'public_domain', 'own_work');

-- CreateEnum
CREATE TYPE "Tradition" AS ENUM ('hellenistic', 'medieval', 'renaissance', 'vedic', 'modern', 'human_design', 'tarot');

-- CreateEnum
CREATE TYPE "CrossRefType" AS ENUM ('derives_from', 'contrasts', 'refines', 'translates_to', 'see_also');

-- CreateTable
CREATE TABLE "Author" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lifespan" TEXT,
    "tradition" "Tradition",
    "bio" TEXT,

    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kind" "SourceKind" NOT NULL,
    "year" INTEGER,
    "publisher" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "rights" "RightsStatus" NOT NULL,
    "notes" TEXT,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceAuthor" (
    "sourceId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'author',

    CONSTRAINT "SourceAuthor_pkey" PRIMARY KEY ("sourceId","authorId","role")
);

-- CreateTable
CREATE TABLE "Edition" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "translator" TEXT,
    "year" INTEGER,
    "publisher" TEXT,
    "isbn" TEXT,
    "notes" TEXT,

    CONSTRAINT "Edition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Excerpt" (
    "id" TEXT NOT NULL,
    "editionId" TEXT NOT NULL,
    "locator" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "verifiedAt" TIMESTAMP(3),

    CONSTRAINT "Excerpt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Concept" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "tradition" "Tradition",
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Concept_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Term" (
    "id" TEXT NOT NULL,
    "conceptId" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "name" TEXT NOT NULL,
    "plainDefinition" TEXT NOT NULL,
    "deepDefinition" TEXT,

    CONSTRAINT "Term_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "EpistemicStatus" NOT NULL,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimConcept" (
    "claimId" TEXT NOT NULL,
    "conceptId" TEXT NOT NULL,

    CONSTRAINT "ClaimConcept_pkey" PRIMARY KEY ("claimId","conceptId")
);

-- CreateTable
CREATE TABLE "Citation" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "excerptId" TEXT,
    "editionId" TEXT,
    "sourceId" TEXT,
    "locator" TEXT,
    "note" TEXT,

    CONSTRAINT "Citation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrossRef" (
    "id" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "type" "CrossRefType" NOT NULL,
    "note" TEXT,

    CONSTRAINT "CrossRef_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Author_slug_key" ON "Author"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Source_slug_key" ON "Source"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Concept_slug_key" ON "Concept"("slug");

-- CreateIndex
CREATE INDEX "Term_language_name_idx" ON "Term"("language", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Term_conceptId_language_name_key" ON "Term"("conceptId", "language", "name");

-- CreateIndex
CREATE UNIQUE INDEX "CrossRef_fromId_toId_type_key" ON "CrossRef"("fromId", "toId", "type");

-- AddForeignKey
ALTER TABLE "SourceAuthor" ADD CONSTRAINT "SourceAuthor_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceAuthor" ADD CONSTRAINT "SourceAuthor_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edition" ADD CONSTRAINT "Edition_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Excerpt" ADD CONSTRAINT "Excerpt_editionId_fkey" FOREIGN KEY ("editionId") REFERENCES "Edition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Term" ADD CONSTRAINT "Term_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "Concept"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimConcept" ADD CONSTRAINT "ClaimConcept_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimConcept" ADD CONSTRAINT "ClaimConcept_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "Concept"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Citation" ADD CONSTRAINT "Citation_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Citation" ADD CONSTRAINT "Citation_excerptId_fkey" FOREIGN KEY ("excerptId") REFERENCES "Excerpt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Citation" ADD CONSTRAINT "Citation_editionId_fkey" FOREIGN KEY ("editionId") REFERENCES "Edition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Citation" ADD CONSTRAINT "Citation_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrossRef" ADD CONSTRAINT "CrossRef_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "Concept"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrossRef" ADD CONSTRAINT "CrossRef_toId_fkey" FOREIGN KEY ("toId") REFERENCES "Concept"("id") ON DELETE CASCADE ON UPDATE CASCADE;
