-- CreateEnum
CREATE TYPE "public"."ConfirmationStatus" AS ENUM ('pending', 'confirmed', 'rejected');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('admin', 'superAdmin', 'vendor');

-- CreateEnum
CREATE TYPE "public"."WeddingType" AS ENUM ('chinese', 'malay', 'indian', 'western', 'others');

-- CreateEnum
CREATE TYPE "public"."WeddingService" AS ENUM ('venue', 'catering', 'photography', 'decoration', 'music', 'attire', 'makeup', 'transportation');

-- CreateEnum
CREATE TYPE "public"."WeddingStyle" AS ENUM ('luxury', 'modern', 'traditional', 'rustic');

-- CreateEnum
CREATE TYPE "public"."BudgetBucket" AS ENUM ('low', 'medium', 'high', 'luxury');

-- CreateEnum
CREATE TYPE "public"."GuestCountBucket" AS ENUM ('small', 'medium', 'large');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."VendorOnboardingStatus" AS ENUM ('pending', 'rejected', 'onboarded');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Admin" (
    "userId" INTEGER NOT NULL,
    "isSuspended" BOOLEAN NOT NULL DEFAULT false,
    "onboardedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mainWeddingId" INTEGER,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."SuperAdmin" (
    "userId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "public"."Vendor" (
    "userId" INTEGER NOT NULL,
    "vendorWebsite" TEXT,
    "uenNumber" TEXT,
    "onboardedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bio" TEXT,
    "rating" DOUBLE PRECISION DEFAULT 0,
    "isSuspended" BOOLEAN NOT NULL DEFAULT false,
    "serviceOffered" "public"."WeddingService" NOT NULL,
    "styleOffered" "public"."WeddingStyle" NOT NULL,
    "weddingTypes" "public"."WeddingType"[],
    "capacity" INTEGER,
    "onboardingStatus" "public"."VendorOnboardingStatus" NOT NULL DEFAULT 'pending'
);

-- CreateTable
CREATE TABLE "public"."Wedding" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "weddingType" "public"."WeddingType" NOT NULL,
    "budgetBucket" "public"."BudgetBucket" NOT NULL,
    "guestCountBucket" "public"."GuestCountBucket" NOT NULL,
    "preferredStyle" "public"."WeddingStyle" NOT NULL,
    "preferredServices" "public"."WeddingService"[],

    CONSTRAINT "Wedding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Guest" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "allergies" TEXT,
    "group" TEXT,
    "confirmationStatus" "public"."ConfirmationStatus" NOT NULL DEFAULT 'pending',
    "weddingId" INTEGER NOT NULL,
    "primaryGuestId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Listing" (
    "id" SERIAL NOT NULL,
    "listingName" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "availabilities" TIMESTAMP(3)[],
    "remarks" TEXT NOT NULL,
    "vendorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Order" (
    "id" SERIAL NOT NULL,
    "orderStatus" "public"."OrderStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remark" TEXT,
    "weddingId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrderListing" (
    "orderId" INTEGER NOT NULL,
    "listingId" INTEGER NOT NULL,

    CONSTRAINT "OrderListing_pkey" PRIMARY KEY ("orderId","listingId")
);

-- CreateTable
CREATE TABLE "public"."SeatingArrangement" (
    "id" SERIAL NOT NULL,
    "weddingId" INTEGER NOT NULL,
    "groupPriorities" JSONB,
    "tables" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeatingArrangement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_AdminWeddings" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AdminWeddings_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SuperAdmin_userId_key" ON "public"."SuperAdmin"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_userId_key" ON "public"."Vendor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SeatingArrangement_weddingId_key" ON "public"."SeatingArrangement"("weddingId");

-- CreateIndex
CREATE INDEX "_AdminWeddings_B_index" ON "public"."_AdminWeddings"("B");

-- AddForeignKey
ALTER TABLE "public"."Admin" ADD CONSTRAINT "Admin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Admin" ADD CONSTRAINT "Admin_mainWeddingId_fkey" FOREIGN KEY ("mainWeddingId") REFERENCES "public"."Wedding"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SuperAdmin" ADD CONSTRAINT "SuperAdmin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Vendor" ADD CONSTRAINT "Vendor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Guest" ADD CONSTRAINT "Guest_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "public"."Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Guest" ADD CONSTRAINT "Guest_primaryGuestId_fkey" FOREIGN KEY ("primaryGuestId") REFERENCES "public"."Guest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Listing" ADD CONSTRAINT "Listing_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendor"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "public"."Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderListing" ADD CONSTRAINT "OrderListing_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderListing" ADD CONSTRAINT "OrderListing_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SeatingArrangement" ADD CONSTRAINT "SeatingArrangement_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "public"."Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AdminWeddings" ADD CONSTRAINT "_AdminWeddings_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Admin"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AdminWeddings" ADD CONSTRAINT "_AdminWeddings_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;
