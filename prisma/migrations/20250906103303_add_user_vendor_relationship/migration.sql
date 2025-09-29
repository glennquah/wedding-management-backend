-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('user', 'admin', 'superAdmin', 'vendor');

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
    "onboardedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weddingType" "public"."WeddingType" NOT NULL,
    "budgetBucket" "public"."BudgetBucket" NOT NULL,
    "guestCountBucket" "public"."GuestCountBucket" NOT NULL,
    "preferredStyle" "public"."WeddingStyle" NOT NULL,
    "preferredServices" "public"."WeddingService"[]
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
    "serviceOffered" "public"."WeddingService" NOT NULL,
    "styleOffered" "public"."WeddingStyle" NOT NULL,
    "weddingTypes" "public"."WeddingType"[],
    "capacity" INTEGER
);

-- CreateTable
CREATE TABLE "public"."TestUser" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_userId_key" ON "public"."Admin"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SuperAdmin_userId_key" ON "public"."SuperAdmin"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_userId_key" ON "public"."Vendor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TestUser_email_key" ON "public"."TestUser"("email");

-- AddForeignKey
ALTER TABLE "public"."Admin" ADD CONSTRAINT "Admin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SuperAdmin" ADD CONSTRAINT "SuperAdmin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Vendor" ADD CONSTRAINT "Vendor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
