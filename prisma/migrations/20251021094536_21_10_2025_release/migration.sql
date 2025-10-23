-- CreateEnum
CREATE TYPE "ConfirmationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'SUPERADMIN', 'VENDOR');

-- CreateEnum
CREATE TYPE "WeddingType" AS ENUM ('CHINESE', 'MALAY', 'INDIAN', 'WESTERN', 'OTHERS');

-- CreateEnum
CREATE TYPE "WeddingService" AS ENUM ('VENUE', 'CATERING', 'PHOTOGRAPHY', 'DECORATION', 'MUSIC', 'ATTIRE', 'MAKEUP', 'TRANSPORTATION');

-- CreateEnum
CREATE TYPE "WeddingStyle" AS ENUM ('LUXURY', 'MODERN', 'TRADITIONAL', 'RUSTIC');

-- CreateEnum
CREATE TYPE "BudgetBucket" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'LUXURY');

-- CreateEnum
CREATE TYPE "GuestCountBucket" AS ENUM ('SMALL', 'MEDIUM', 'LARGE');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "VendorOnboardingStatus" AS ENUM ('PENDING', 'REJECTED', 'ONBOARDED');

-- CreateEnum
CREATE TYPE "EmailTemplateType" AS ENUM ('PASSWORD_RESET', 'WELCOME', 'VERIFY_EMAIL', 'CREATE_ACCOUNT', 'SUPER_ADMIN_ONBOARDING', 'VENDOR_STATUS', 'VENDOR_SUSPENSION', 'ADMIN_SUSPENSION', 'COLLABORATOR_ADDED', 'CALENDAR_ACCESS_REQUEST', 'RSVP_INVITATION', 'CUSTOM', 'GUEST_GRATITUDE_CARD', 'COLLABORATOR_GRATITUDE_CARD', 'VENDOR_GRATITUDE_CARD');

-- CreateEnum
CREATE TYPE "CalendarAccessStatus" AS ENUM ('NOT_REQUESTED', 'REQUESTED', 'REJECTED', 'CONNECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "userId" INTEGER NOT NULL,
    "isSuspended" BOOLEAN NOT NULL DEFAULT false,
    "onboardedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mainWeddingId" INTEGER,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "GoogleCalendarConnection" (
    "id" SERIAL NOT NULL,
    "guestId" INTEGER,
    "adminId" INTEGER,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "tokenExpiry" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "accessStatus" "CalendarAccessStatus" NOT NULL DEFAULT 'NOT_REQUESTED',
    "accessRequestedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleCalendarConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuperAdmin" (
    "userId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Vendor" (
    "userId" INTEGER NOT NULL,
    "vendorWebsite" TEXT,
    "uenNumber" TEXT,
    "onboardedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bio" TEXT,
    "rating" DOUBLE PRECISION DEFAULT 0,
    "isSuspended" BOOLEAN NOT NULL DEFAULT false,
    "serviceOffered" "WeddingService",
    "styleOffered" "WeddingStyle",
    "weddingTypes" "WeddingType"[],
    "capacity" INTEGER,
    "onboardingStatus" "VendorOnboardingStatus" NOT NULL DEFAULT 'PENDING'
);

-- CreateTable
CREATE TABLE "EmailTemplate" (
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
CREATE TABLE "EmailNotificationHistory" (
    "id" SERIAL NOT NULL,
    "to" TEXT[],
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "EmailTemplateType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "notificationDetailsId" INTEGER NOT NULL,

    CONSTRAINT "EmailNotificationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationDetails" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "weddingId" INTEGER,
    "vendorId" INTEGER,
    "isSuperAdminNotification" BOOLEAN DEFAULT false,

    CONSTRAINT "NotificationDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wedding" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "location" TEXT,
    "keyAttendeeIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "allocatedBudget" DOUBLE PRECISION NOT NULL,
    "currentSpending" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "weddingType" "WeddingType" NOT NULL,
    "budgetBucket" "BudgetBucket" NOT NULL,
    "guestCountBucket" "GuestCountBucket" NOT NULL,
    "preferredStyle" "WeddingStyle" NOT NULL,
    "preferredServices" "WeddingService"[],
    "dateOptimizerEarliestDate" TEXT,
    "dateOptimizerLatestDate" TEXT,
    "dateOptimizerPreferredDays" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dateOptimizerLastResults" JSONB,

    CONSTRAINT "Wedding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Microsite" (
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
CREATE TABLE "GratitudeCard" (
    "id" SERIAL NOT NULL,
    "signOffName" TEXT NOT NULL,
    "guestCardMessage" TEXT,
    "collaboratorCardMessage" TEXT,
    "vendorCardMessage" TEXT,
    "guestCardPhotoURL" TEXT,
    "collaboratorCardPhotoURL" TEXT,
    "weddingId" INTEGER NOT NULL,

    CONSTRAINT "GratitudeCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Album" (
    "id" SERIAL NOT NULL,
    "coupleName" TEXT NOT NULL,
    "inviteCardMessage" TEXT NOT NULL,
    "landingMessage" TEXT NOT NULL,
    "albumURL" TEXT,
    "photos" TEXT[],
    "weddingId" INTEGER NOT NULL,

    CONSTRAINT "Album_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guestbook" (
    "id" SERIAL NOT NULL,
    "guestNotes" JSONB[],
    "weddingId" INTEGER NOT NULL,

    CONSTRAINT "Guestbook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guest" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "allergies" TEXT,
    "group" TEXT,
    "confirmationStatus" "ConfirmationStatus" NOT NULL DEFAULT 'PENDING',
    "attendance" BOOLEAN NOT NULL DEFAULT false,
    "checkInTime" TIMESTAMP(3),
    "weddingId" INTEGER NOT NULL,
    "primaryGuestId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
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
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "orderStatus" "OrderStatus" NOT NULL DEFAULT 'PENDING',
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
CREATE TABLE "OrderListing" (
    "orderId" INTEGER NOT NULL,
    "listingId" INTEGER NOT NULL,
    "bookedSlots" JSONB NOT NULL,
    "bookingStatus" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderListing_pkey" PRIMARY KEY ("orderId","listingId")
);

-- CreateTable
CREATE TABLE "Cart" (
    "id" SERIAL NOT NULL,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "adminId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" SERIAL NOT NULL,
    "cartId" INTEGER NOT NULL,
    "listingId" INTEGER NOT NULL,
    "selectedSlots" JSONB NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "stripeCheckoutSessionId" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'SGD',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "orderId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeatingArrangement" (
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
CREATE TABLE "TokenBlacklist" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TokenBlacklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AdminWeddings" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AdminWeddings_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleCalendarConnection_guestId_key" ON "GoogleCalendarConnection"("guestId");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleCalendarConnection_adminId_key" ON "GoogleCalendarConnection"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "SuperAdmin_userId_key" ON "SuperAdmin"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_userId_key" ON "Vendor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationDetails_weddingId_key" ON "NotificationDetails"("weddingId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationDetails_vendorId_key" ON "NotificationDetails"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "Microsite_slug_key" ON "Microsite"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Microsite_weddingId_key" ON "Microsite"("weddingId");

-- CreateIndex
CREATE UNIQUE INDEX "GratitudeCard_weddingId_key" ON "GratitudeCard"("weddingId");

-- CreateIndex
CREATE UNIQUE INDEX "Album_weddingId_key" ON "Album"("weddingId");

-- CreateIndex
CREATE UNIQUE INDEX "Guestbook_weddingId_key" ON "Guestbook"("weddingId");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_adminId_key" ON "Cart"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_listingId_key" ON "CartItem"("cartId", "listingId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripeCheckoutSessionId_key" ON "Payment"("stripeCheckoutSessionId");

-- CreateIndex
CREATE INDEX "Payment_stripeCheckoutSessionId_idx" ON "Payment"("stripeCheckoutSessionId");

-- CreateIndex
CREATE INDEX "Payment_stripePaymentIntentId_idx" ON "Payment"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "Payment_paymentStatus_idx" ON "Payment"("paymentStatus");

-- CreateIndex
CREATE UNIQUE INDEX "SeatingArrangement_weddingId_key" ON "SeatingArrangement"("weddingId");

-- CreateIndex
CREATE UNIQUE INDEX "TokenBlacklist_token_key" ON "TokenBlacklist"("token");

-- CreateIndex
CREATE INDEX "TokenBlacklist_token_idx" ON "TokenBlacklist"("token");

-- CreateIndex
CREATE INDEX "TokenBlacklist_expiresAt_idx" ON "TokenBlacklist"("expiresAt");

-- CreateIndex
CREATE INDEX "_AdminWeddings_B_index" ON "_AdminWeddings"("B");

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_mainWeddingId_fkey" FOREIGN KEY ("mainWeddingId") REFERENCES "Wedding"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoogleCalendarConnection" ADD CONSTRAINT "GoogleCalendarConnection_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoogleCalendarConnection" ADD CONSTRAINT "GoogleCalendarConnection_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuperAdmin" ADD CONSTRAINT "SuperAdmin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailTemplate" ADD CONSTRAINT "EmailTemplate_notificationDetailsId_fkey" FOREIGN KEY ("notificationDetailsId") REFERENCES "NotificationDetails"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailNotificationHistory" ADD CONSTRAINT "EmailNotificationHistory_notificationDetailsId_fkey" FOREIGN KEY ("notificationDetailsId") REFERENCES "NotificationDetails"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationDetails" ADD CONSTRAINT "NotificationDetails_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationDetails" ADD CONSTRAINT "NotificationDetails_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Microsite" ADD CONSTRAINT "Microsite_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GratitudeCard" ADD CONSTRAINT "GratitudeCard_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Album" ADD CONSTRAINT "Album_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guestbook" ADD CONSTRAINT "Guestbook_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_primaryGuestId_fkey" FOREIGN KEY ("primaryGuestId") REFERENCES "Guest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderListing" ADD CONSTRAINT "OrderListing_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderListing" ADD CONSTRAINT "OrderListing_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatingArrangement" ADD CONSTRAINT "SeatingArrangement_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdminWeddings" ADD CONSTRAINT "_AdminWeddings_A_fkey" FOREIGN KEY ("A") REFERENCES "Admin"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdminWeddings" ADD CONSTRAINT "_AdminWeddings_B_fkey" FOREIGN KEY ("B") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;
