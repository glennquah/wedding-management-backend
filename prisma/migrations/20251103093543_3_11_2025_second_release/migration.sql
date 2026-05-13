-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."EmailTemplateType" ADD VALUE 'REGISTER_DATING_USER';
ALTER TYPE "public"."EmailTemplateType" ADD VALUE 'DATING_PLATFORM_PAYOUT';

-- AlterTable
ALTER TABLE "public"."Admin" ADD COLUMN     "isDatingPartnerRegistered" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."DatingPartnerCommission" (
    "id" SERIAL NOT NULL,
    "adminId" INTEGER NOT NULL,
    "orderId" INTEGER NOT NULL,
    "listingId" INTEGER NOT NULL,
    "grossAmount" DOUBLE PRECISION NOT NULL,
    "commissionRate" DOUBLE PRECISION NOT NULL,
    "commissionAmount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'SGD',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "stripeTransferId" TEXT,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DatingPartnerCommission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DatingPartnerCommission_stripeTransferId_key" ON "public"."DatingPartnerCommission"("stripeTransferId");

-- CreateIndex
CREATE INDEX "DatingPartnerCommission_adminId_idx" ON "public"."DatingPartnerCommission"("adminId");

-- CreateIndex
CREATE INDEX "DatingPartnerCommission_status_idx" ON "public"."DatingPartnerCommission"("status");

-- CreateIndex
CREATE UNIQUE INDEX "DatingPartnerCommission_orderId_listingId_key" ON "public"."DatingPartnerCommission"("orderId", "listingId");
