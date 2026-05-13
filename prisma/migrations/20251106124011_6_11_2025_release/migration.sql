-- CreateTable
CREATE TABLE "public"."WeddingWrapped" (
    "id" SERIAL NOT NULL,
    "weddingId" INTEGER NOT NULL,
    "totalInvited" INTEGER NOT NULL,
    "totalConfirmed" INTEGER NOT NULL,
    "totalAttended" INTEGER NOT NULL,
    "firstGuestName" TEXT,
    "firstGuestTime" TIMESTAMP(3),
    "fastestRsvpName" TEXT,
    "fastestRsvpDuration" INTEGER,
    "peakTime" TIMESTAMP(3),
    "peakGuestCount" INTEGER,
    "squadBreakdown" JSONB NOT NULL,
    "mostWantedItem" TEXT,
    "mostWantedItemCount" INTEGER,
    "topContributorName" TEXT,
    "topContribution" DOUBLE PRECISION,
    "wishlistCompletion" DOUBLE PRECISION NOT NULL,
    "totalGiftValue" DOUBLE PRECISION NOT NULL,
    "planningDays" INTEGER NOT NULL,
    "topVendorCategory" "public"."WeddingService",
    "topVendorAmount" DOUBLE PRECISION,
    "budgetUtilization" DOUBLE PRECISION NOT NULL,
    "totalSpent" DOUBLE PRECISION NOT NULL,
    "allocatedBudget" DOUBLE PRECISION NOT NULL,
    "totalWellWishes" INTEGER NOT NULL,
    "totalPhotos" INTEGER NOT NULL,
    "totalFacesDetected" INTEGER NOT NULL,
    "totalPeopleClusters" INTEGER NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeddingWrapped_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WeddingWrapped_weddingId_key" ON "public"."WeddingWrapped"("weddingId");

-- CreateIndex
CREATE INDEX "WeddingWrapped_weddingId_idx" ON "public"."WeddingWrapped"("weddingId");
