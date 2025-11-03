-- CreateTable
CREATE TABLE "public"."Review" (
    "id" SERIAL NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "orderId" INTEGER NOT NULL,
    "listingId" INTEGER NOT NULL,
    "vendorId" INTEGER NOT NULL,
    "adminId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Review_vendorId_idx" ON "public"."Review"("vendorId");

-- CreateIndex
CREATE INDEX "Review_adminId_idx" ON "public"."Review"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_orderId_listingId_key" ON "public"."Review"("orderId", "listingId");

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_orderId_listingId_fkey" FOREIGN KEY ("orderId", "listingId") REFERENCES "public"."OrderListing"("orderId", "listingId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendor"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."Admin"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
