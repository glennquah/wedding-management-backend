-- CreateEnum
CREATE TYPE "public"."ConfirmationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'SUPERADMIN', 'VENDOR');

-- CreateEnum
CREATE TYPE "public"."WeddingType" AS ENUM ('CHINESE', 'MALAY', 'INDIAN', 'WESTERN', 'OTHERS');

-- CreateEnum
CREATE TYPE "public"."WeddingService" AS ENUM ('VENUE', 'CATERING', 'PHOTOGRAPHY', 'DECORATION', 'MUSIC', 'ATTIRE', 'MAKEUP', 'TRANSPORTATION');

-- CreateEnum
CREATE TYPE "public"."WeddingStyle" AS ENUM ('LUXURY', 'MODERN', 'TRADITIONAL', 'RUSTIC');

-- CreateEnum
CREATE TYPE "public"."BudgetBucket" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'LUXURY');

-- CreateEnum
CREATE TYPE "public"."GuestCountBucket" AS ENUM ('SMALL', 'MEDIUM', 'LARGE');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "public"."VendorOnboardingStatus" AS ENUM ('PENDING', 'REJECTED', 'ONBOARDED');

-- CreateEnum
CREATE TYPE "public"."EmailTemplateType" AS ENUM ('PASSWORD_RESET', 'WELCOME', 'VERIFY_EMAIL', 'CREATE_ACCOUNT', 'VENDOR_STATUS', 'VENDOR_SUSPENSION', 'ADMIN_SUSPENSION', 'CUSTOM');

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
    "serviceOffered" "public"."WeddingService",
    "styleOffered" "public"."WeddingStyle",
    "weddingTypes" "public"."WeddingType"[],
    "capacity" INTEGER,
    "onboardingStatus" "public"."VendorOnboardingStatus" NOT NULL DEFAULT 'PENDING'
);

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
CREATE TABLE "public"."Microsite" (
    "id" SERIAL NOT NULL,
    "templateNumber" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "coupleName" TEXT NOT NULL,
    "heroImages" TEXT[],
    "imageGallery" TEXT[],
    "schedule" JSONB,
    "faqs" JSONB,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "weddingId" INTEGER NOT NULL,

    CONSTRAINT "Microsite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Guest" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "allergies" TEXT,
    "group" TEXT,
    "confirmationStatus" "public"."ConfirmationStatus" NOT NULL DEFAULT 'PENDING',
    "attendance" BOOLEAN NOT NULL DEFAULT false,
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
    "availabilities" JSONB NOT NULL,
    "remarks" TEXT NOT NULL,
    "imageUrls" TEXT[],
    "vendorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Order" (
    "id" SERIAL NOT NULL,
    "orderStatus" "public"."OrderStatus" NOT NULL DEFAULT 'PENDING',
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'SGD',
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
    "bookedSlots" JSONB NOT NULL,

    CONSTRAINT "OrderListing_pkey" PRIMARY KEY ("orderId","listingId")
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

-- CreateTable
CREATE TABLE "public"."SeatingArrangement" (
    "id" SERIAL NOT NULL,
    "weddingId" INTEGER NOT NULL,
    "groupPriorities" JSONB,
    "tables" JSONB NOT NULL,
    "tablesPerRow" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeatingArrangement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TokenBlacklist" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TokenBlacklist_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "NotificationDetails_weddingId_key" ON "public"."NotificationDetails"("weddingId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationDetails_vendorId_key" ON "public"."NotificationDetails"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "Microsite_slug_key" ON "public"."Microsite"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Microsite_weddingId_key" ON "public"."Microsite"("weddingId");

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

-- CreateIndex
CREATE UNIQUE INDEX "SeatingArrangement_weddingId_key" ON "public"."SeatingArrangement"("weddingId");

-- CreateIndex
CREATE UNIQUE INDEX "TokenBlacklist_token_key" ON "public"."TokenBlacklist"("token");

-- CreateIndex
CREATE INDEX "TokenBlacklist_token_idx" ON "public"."TokenBlacklist"("token");

-- CreateIndex
CREATE INDEX "TokenBlacklist_expiresAt_idx" ON "public"."TokenBlacklist"("expiresAt");

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
ALTER TABLE "public"."EmailTemplate" ADD CONSTRAINT "EmailTemplate_notificationDetailsId_fkey" FOREIGN KEY ("notificationDetailsId") REFERENCES "public"."NotificationDetails"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailNotificationHistory" ADD CONSTRAINT "EmailNotificationHistory_notificationDetailsId_fkey" FOREIGN KEY ("notificationDetailsId") REFERENCES "public"."NotificationDetails"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NotificationDetails" ADD CONSTRAINT "NotificationDetails_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "public"."Wedding"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NotificationDetails" ADD CONSTRAINT "NotificationDetails_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendor"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Microsite" ADD CONSTRAINT "Microsite_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "public"."Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "public"."Cart" ADD CONSTRAINT "Cart_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."Admin"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "public"."Cart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CartItem" ADD CONSTRAINT "CartItem_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SeatingArrangement" ADD CONSTRAINT "SeatingArrangement_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "public"."Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AdminWeddings" ADD CONSTRAINT "_AdminWeddings_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Admin"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AdminWeddings" ADD CONSTRAINT "_AdminWeddings_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;
