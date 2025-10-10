/*
  Warnings:

  - The values [low,medium,high,luxury] on the enum `BudgetBucket` will be removed. If these variants are still used in the database, this will fail.
  - The values [pending,confirmed,rejected] on the enum `ConfirmationStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [small,medium,large] on the enum `GuestCountBucket` will be removed. If these variants are still used in the database, this will fail.
  - The values [admin,superAdmin,vendor] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - The values [pending,rejected,onboarded] on the enum `VendorOnboardingStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [venue,catering,photography,decoration,music,attire,makeup,transportation] on the enum `WeddingService` will be removed. If these variants are still used in the database, this will fail.
  - The values [luxury,modern,traditional,rustic] on the enum `WeddingStyle` will be removed. If these variants are still used in the database, this will fail.
  - The values [chinese,malay,indian,western,others] on the enum `WeddingType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `paymentMethod` on the `Order` table. All the data in the column will be lost.
  - Changed the type of `availabilities` on the `Listing` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `totalAmount` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bookedSlots` to the `OrderListing` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "public"."EmailTemplateType" AS ENUM ('PASSWORD_RESET', 'WELCOME', 'VERIFY_EMAIL', 'CREATE_ACCOUNT', 'CUSTOM');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."BudgetBucket_new" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'LUXURY');
ALTER TABLE "public"."Wedding" ALTER COLUMN "budgetBucket" TYPE "public"."BudgetBucket_new" USING ("budgetBucket"::text::"public"."BudgetBucket_new");
ALTER TYPE "public"."BudgetBucket" RENAME TO "BudgetBucket_old";
ALTER TYPE "public"."BudgetBucket_new" RENAME TO "BudgetBucket";
DROP TYPE "public"."BudgetBucket_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."ConfirmationStatus_new" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED');
ALTER TABLE "public"."Guest" ALTER COLUMN "confirmationStatus" DROP DEFAULT;
ALTER TABLE "public"."Guest" ALTER COLUMN "confirmationStatus" TYPE "public"."ConfirmationStatus_new" USING ("confirmationStatus"::text::"public"."ConfirmationStatus_new");
ALTER TYPE "public"."ConfirmationStatus" RENAME TO "ConfirmationStatus_old";
ALTER TYPE "public"."ConfirmationStatus_new" RENAME TO "ConfirmationStatus";
DROP TYPE "public"."ConfirmationStatus_old";
ALTER TABLE "public"."Guest" ALTER COLUMN "confirmationStatus" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."GuestCountBucket_new" AS ENUM ('SMALL', 'MEDIUM', 'LARGE');
ALTER TABLE "public"."Wedding" ALTER COLUMN "guestCountBucket" TYPE "public"."GuestCountBucket_new" USING ("guestCountBucket"::text::"public"."GuestCountBucket_new");
ALTER TYPE "public"."GuestCountBucket" RENAME TO "GuestCountBucket_old";
ALTER TYPE "public"."GuestCountBucket_new" RENAME TO "GuestCountBucket";
DROP TYPE "public"."GuestCountBucket_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."UserRole_new" AS ENUM ('ADMIN', 'SUPERADMIN', 'VENDOR');
ALTER TABLE "public"."User" ALTER COLUMN "role" TYPE "public"."UserRole_new" USING ("role"::text::"public"."UserRole_new");
ALTER TYPE "public"."UserRole" RENAME TO "UserRole_old";
ALTER TYPE "public"."UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."VendorOnboardingStatus_new" AS ENUM ('PENDING', 'REJECTED', 'ONBOARDED');
ALTER TABLE "public"."Vendor" ALTER COLUMN "onboardingStatus" DROP DEFAULT;
ALTER TABLE "public"."Vendor" ALTER COLUMN "onboardingStatus" TYPE "public"."VendorOnboardingStatus_new" USING ("onboardingStatus"::text::"public"."VendorOnboardingStatus_new");
ALTER TYPE "public"."VendorOnboardingStatus" RENAME TO "VendorOnboardingStatus_old";
ALTER TYPE "public"."VendorOnboardingStatus_new" RENAME TO "VendorOnboardingStatus";
DROP TYPE "public"."VendorOnboardingStatus_old";
ALTER TABLE "public"."Vendor" ALTER COLUMN "onboardingStatus" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."WeddingService_new" AS ENUM ('VENUE', 'CATERING', 'PHOTOGRAPHY', 'DECORATION', 'MUSIC', 'ATTIRE', 'MAKEUP', 'TRANSPORTATION');
ALTER TABLE "public"."Vendor" ALTER COLUMN "serviceOffered" TYPE "public"."WeddingService_new" USING ("serviceOffered"::text::"public"."WeddingService_new");
ALTER TABLE "public"."Wedding" ALTER COLUMN "preferredServices" TYPE "public"."WeddingService_new"[] USING ("preferredServices"::text::"public"."WeddingService_new"[]);
ALTER TYPE "public"."WeddingService" RENAME TO "WeddingService_old";
ALTER TYPE "public"."WeddingService_new" RENAME TO "WeddingService";
DROP TYPE "public"."WeddingService_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."WeddingStyle_new" AS ENUM ('LUXURY', 'MODERN', 'TRADITIONAL', 'RUSTIC');
ALTER TABLE "public"."Vendor" ALTER COLUMN "styleOffered" TYPE "public"."WeddingStyle_new" USING ("styleOffered"::text::"public"."WeddingStyle_new");
ALTER TABLE "public"."Wedding" ALTER COLUMN "preferredStyle" TYPE "public"."WeddingStyle_new" USING ("preferredStyle"::text::"public"."WeddingStyle_new");
ALTER TYPE "public"."WeddingStyle" RENAME TO "WeddingStyle_old";
ALTER TYPE "public"."WeddingStyle_new" RENAME TO "WeddingStyle";
DROP TYPE "public"."WeddingStyle_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."WeddingType_new" AS ENUM ('CHINESE', 'MALAY', 'INDIAN', 'WESTERN', 'OTHERS');
ALTER TABLE "public"."Vendor" ALTER COLUMN "weddingTypes" TYPE "public"."WeddingType_new"[] USING ("weddingTypes"::text::"public"."WeddingType_new"[]);
ALTER TABLE "public"."Wedding" ALTER COLUMN "weddingType" TYPE "public"."WeddingType_new" USING ("weddingType"::text::"public"."WeddingType_new");
ALTER TYPE "public"."WeddingType" RENAME TO "WeddingType_old";
ALTER TYPE "public"."WeddingType_new" RENAME TO "WeddingType";
DROP TYPE "public"."WeddingType_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."Guest" ALTER COLUMN "confirmationStatus" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "public"."Listing" ADD COLUMN     "imageUrls" TEXT[],
DROP COLUMN "availabilities",
ADD COLUMN     "availabilities" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "public"."Order" DROP COLUMN "paymentMethod",
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'SGD',
ADD COLUMN     "totalAmount" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "public"."OrderListing" ADD COLUMN     "bookedSlots" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "public"."SeatingArrangement" ADD COLUMN     "tablesPerRow" INTEGER;

-- AlterTable
ALTER TABLE "public"."Vendor" ALTER COLUMN "onboardingStatus" SET DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "public"."EmailTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "htmlContent" TEXT NOT NULL,
    "textContent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "notificationDetailsId" INTEGER NOT NULL,

    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailNotificationHistory" (
    "id" SERIAL NOT NULL,
    "to" TEXT[],
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "public"."EmailTemplateType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "notificationDetailsId" INTEGER NOT NULL,

    CONSTRAINT "EmailNotificationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NotificationDetails" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "weddingId" INTEGER,
    "vendorId" INTEGER,
    "isSuperAdminNotification" BOOLEAN DEFAULT false,

    CONSTRAINT "NotificationDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Cart" (
    "id" SERIAL NOT NULL,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "adminId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CartItem" (
    "id" SERIAL NOT NULL,
    "cartId" INTEGER NOT NULL,
    "listingId" INTEGER NOT NULL,
    "selectedSlots" JSONB NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" SERIAL NOT NULL,
    "stripeCheckoutSessionId" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'SGD',
    "paymentStatus" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "orderId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotificationDetails_weddingId_key" ON "public"."NotificationDetails"("weddingId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationDetails_vendorId_key" ON "public"."NotificationDetails"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_adminId_key" ON "public"."Cart"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_listingId_key" ON "public"."CartItem"("cartId", "listingId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripeCheckoutSessionId_key" ON "public"."Payment"("stripeCheckoutSessionId");

-- CreateIndex
CREATE INDEX "Payment_stripeCheckoutSessionId_idx" ON "public"."Payment"("stripeCheckoutSessionId");

-- CreateIndex
CREATE INDEX "Payment_stripePaymentIntentId_idx" ON "public"."Payment"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "Payment_paymentStatus_idx" ON "public"."Payment"("paymentStatus");

-- AddForeignKey
ALTER TABLE "public"."EmailTemplate" ADD CONSTRAINT "EmailTemplate_notificationDetailsId_fkey" FOREIGN KEY ("notificationDetailsId") REFERENCES "public"."NotificationDetails"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailNotificationHistory" ADD CONSTRAINT "EmailNotificationHistory_notificationDetailsId_fkey" FOREIGN KEY ("notificationDetailsId") REFERENCES "public"."NotificationDetails"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NotificationDetails" ADD CONSTRAINT "NotificationDetails_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "public"."Wedding"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NotificationDetails" ADD CONSTRAINT "NotificationDetails_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendor"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cart" ADD CONSTRAINT "Cart_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."Admin"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "public"."Cart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CartItem" ADD CONSTRAINT "CartItem_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
