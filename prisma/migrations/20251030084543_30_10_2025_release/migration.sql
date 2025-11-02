/*
  Warnings:

  - A unique constraint covering the columns `[stripeConnectAccountId]` on the table `Vendor` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."ChatbotStage" AS ENUM ('GETTING_STARTED', 'INITIAL_PLANNING', 'CREATING_THE_FOUNDATION', 'DETAILED_PLANNING', 'DURING_THE_WEDDING', 'AFTER_THE_WEDDING', 'ADDITIONAL_DETAILS', 'CHECKLIST_GENERATED');

-- CreateEnum
CREATE TYPE "public"."ProcessingStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."EmailTemplateType" ADD VALUE 'VENDOR_BOOKING_REJECTION';
ALTER TYPE "public"."EmailTemplateType" ADD VALUE 'VENDOR_BOOKING_CONFIRMATION';

-- AlterTable
ALTER TABLE "public"."Vendor" ADD COLUMN     "stripeAccountOnboardingComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stripeChargesEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stripeConnectAccountId" TEXT,
ADD COLUMN     "stripeDetailsSubmitted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stripePayoutsEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."Wedding" ADD COLUMN     "payLahQR" TEXT;

-- CreateTable
CREATE TABLE "public"."WishlistItem" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "itemUrl" TEXT NOT NULL,
    "isReserved" BOOLEAN NOT NULL DEFAULT false,
    "reservedByName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "weddingId" INTEGER NOT NULL,

    CONSTRAINT "WishlistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Photo" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "albumId" INTEGER NOT NULL,
    "processingStatus" "public"."ProcessingStatus" NOT NULL DEFAULT 'PENDING',
    "processedAt" TIMESTAMP(3),
    "isBlurry" BOOLEAN,
    "blurScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PhotoFace" (
    "id" SERIAL NOT NULL,
    "photoId" INTEGER NOT NULL,
    "encoding" JSONB NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "personClusterId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhotoFace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PersonCluster" (
    "id" SERIAL NOT NULL,
    "albumId" INTEGER NOT NULL,
    "label" TEXT,
    "representativeEncoding" JSONB NOT NULL,
    "thumbnailUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonCluster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VendorEarning" (
    "id" SERIAL NOT NULL,
    "vendorId" INTEGER NOT NULL,
    "orderListingId" TEXT NOT NULL,
    "orderId" INTEGER NOT NULL,
    "listingId" INTEGER NOT NULL,
    "grossAmount" DOUBLE PRECISION NOT NULL,
    "platformFee" DOUBLE PRECISION NOT NULL,
    "netAmount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'SGD',
    "isPaidOut" BOOLEAN NOT NULL DEFAULT false,
    "payoutId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorEarning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VendorPayout" (
    "id" SERIAL NOT NULL,
    "vendorId" INTEGER NOT NULL,
    "stripeTransferId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'SGD',
    "status" TEXT NOT NULL,
    "earningsCount" INTEGER NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "stripePayoutId" TEXT,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorPayout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChatMessage" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "checklistId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Checklist" (
    "id" SERIAL NOT NULL,
    "weddingId" INTEGER NOT NULL,
    "currentStage" "public"."ChatbotStage" NOT NULL DEFAULT 'GETTING_STARTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Checklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChecklistItem" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "monthsBeforeWedding" INTEGER,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "checklistId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CashGift" (
    "id" SERIAL NOT NULL,
    "guestId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "weddingId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CashGift_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WishlistItem_weddingId_idx" ON "public"."WishlistItem"("weddingId");

-- CreateIndex
CREATE INDEX "Photo_albumId_idx" ON "public"."Photo"("albumId");

-- CreateIndex
CREATE INDEX "Photo_processingStatus_idx" ON "public"."Photo"("processingStatus");

-- CreateIndex
CREATE INDEX "Photo_isBlurry_idx" ON "public"."Photo"("isBlurry");

-- CreateIndex
CREATE INDEX "PhotoFace_photoId_idx" ON "public"."PhotoFace"("photoId");

-- CreateIndex
CREATE INDEX "PhotoFace_personClusterId_idx" ON "public"."PhotoFace"("personClusterId");

-- CreateIndex
CREATE INDEX "PersonCluster_albumId_idx" ON "public"."PersonCluster"("albumId");

-- CreateIndex
CREATE INDEX "VendorEarning_vendorId_idx" ON "public"."VendorEarning"("vendorId");

-- CreateIndex
CREATE INDEX "VendorEarning_isPaidOut_idx" ON "public"."VendorEarning"("isPaidOut");

-- CreateIndex
CREATE INDEX "VendorEarning_payoutId_idx" ON "public"."VendorEarning"("payoutId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorEarning_orderId_listingId_key" ON "public"."VendorEarning"("orderId", "listingId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorPayout_stripeTransferId_key" ON "public"."VendorPayout"("stripeTransferId");

-- CreateIndex
CREATE INDEX "VendorPayout_vendorId_idx" ON "public"."VendorPayout"("vendorId");

-- CreateIndex
CREATE INDEX "VendorPayout_status_idx" ON "public"."VendorPayout"("status");

-- CreateIndex
CREATE INDEX "VendorPayout_stripeTransferId_idx" ON "public"."VendorPayout"("stripeTransferId");

-- CreateIndex
CREATE UNIQUE INDEX "Checklist_weddingId_key" ON "public"."Checklist"("weddingId");

-- CreateIndex
CREATE INDEX "CashGift_weddingId_idx" ON "public"."CashGift"("weddingId");

-- CreateIndex
CREATE INDEX "CashGift_guestId_idx" ON "public"."CashGift"("guestId");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_stripeConnectAccountId_key" ON "public"."Vendor"("stripeConnectAccountId");

-- AddForeignKey
ALTER TABLE "public"."WishlistItem" ADD CONSTRAINT "WishlistItem_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "public"."Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Photo" ADD CONSTRAINT "Photo_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "public"."Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PhotoFace" ADD CONSTRAINT "PhotoFace_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "public"."Photo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PhotoFace" ADD CONSTRAINT "PhotoFace_personClusterId_fkey" FOREIGN KEY ("personClusterId") REFERENCES "public"."PersonCluster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PersonCluster" ADD CONSTRAINT "PersonCluster_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "public"."Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatMessage" ADD CONSTRAINT "ChatMessage_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "public"."Checklist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Checklist" ADD CONSTRAINT "Checklist_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "public"."Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChecklistItem" ADD CONSTRAINT "ChecklistItem_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "public"."Checklist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CashGift" ADD CONSTRAINT "CashGift_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "public"."Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CashGift" ADD CONSTRAINT "CashGift_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "public"."Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;
