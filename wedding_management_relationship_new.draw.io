<mxfile host="app.diagrams.net">
  <diagram name="Wedding Management ERD" id="wedding-erd">
    <mxGraphModel dx="1422" dy="762" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="3300" pageHeight="4200" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />

        <!-- User -->
        <mxCell id="user" value="User&#xa;---&#xa;id: Int (PK)&#xa;name: String&#xa;email: String (unique)&#xa;password: String&#xa;role: UserRole&#xa;createdAt: DateTime&#xa;updatedAt: DateTime" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;align=left;verticalAlign=top;" vertex="1" parent="1">
          <mxGeometry x="80" y="40" width="200" height="140" as="geometry" />
        </mxCell>

        <!-- Admin -->
        <mxCell id="admin" value="Admin&#xa;---&#xa;userId: Int (PK, FK)&#xa;isSuspended: Boolean&#xa;isDatingPartnerRegistered: Boolean&#xa;onboardedDate: DateTime&#xa;mainWeddingId: Int (FK)" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;align=left;verticalAlign=top;" vertex="1" parent="1">
          <mxGeometry x="40" y="240" width="240" height="120" as="geometry" />
        </mxCell>

        <!-- SuperAdmin -->
        <mxCell id="superadmin" value="SuperAdmin&#xa;---&#xa;userId: Int (PK, FK)" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;align=left;verticalAlign=top;" vertex="1" parent="1">
          <mxGeometry x="320" y="240" width="180" height="60" as="geometry" />
        </mxCell>

        <!-- Vendor -->
        <mxCell id="vendor" value="Vendor&#xa;---&#xa;userId: Int (PK, FK)&#xa;vendorWebsite: String?&#xa;uenNumber: String?&#xa;onboardedDate: DateTime&#xa;bio: String?&#xa;rating: Float?&#xa;isSuspended: Boolean&#xa;serviceOffered: WeddingService?&#xa;styleOffered: WeddingStyle?&#xa;weddingTypes: WeddingType[]&#xa;capacity: Int?&#xa;onboardingStatus: VendorOnboardingStatus&#xa;stripeConnectAccountId: String? (unique)&#xa;stripeAccountOnboardingComplete: Boolean&#xa;stripeChargesEnabled: Boolean&#xa;stripePayoutsEnabled: Boolean&#xa;stripeDetailsSubmitted: Boolean" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;align=left;verticalAlign=top;" vertex="1" parent="1">
          <mxGeometry x="560" y="40" width="300" height="320" as="geometry" />
        </mxCell>

        <!-- Wedding -->
        <mxCell id="wedding" value="Wedding&#xa;---&#xa;id: Int (PK)&#xa;name: String&#xa;date: DateTime?&#xa;location: String?&#xa;keyAttendeeIds: Int[]&#xa;createdAt: DateTime&#xa;updatedAt: DateTime&#xa;allocatedBudget: Float&#xa;currentSpending: Float&#xa;weddingType: WeddingType&#xa;budgetBucket: BudgetBucket&#xa;guestCountBucket: GuestCountBucket&#xa;preferredStyle: WeddingStyle&#xa;preferredServices: WeddingService[]&#xa;payLahQR: String?&#xa;dateOptimizerEarliestDate: String?&#xa;dateOptimizerLatestDate: String?&#xa;dateOptimizerPreferredDays: String[]&#xa;dateOptimizerLastResults: Json?" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;align=left;verticalAlign=top;" vertex="1" parent="1">
          <mxGeometry x="40" y="440" width="280" height="380" as="geometry" />
        </mxCell>

        <!-- Guest -->
        <mxCell id="guest" value="Guest&#xa;---&#xa;id: Int (PK)&#xa;email: String&#xa;name: String&#xa;allergies: String?&#xa;group: String?&#xa;confirmationStatus: ConfirmationStatus&#xa;attendance: Boolean&#xa;checkInTime: DateTime?&#xa;weddingId: Int (FK)&#xa;primaryGuestId: Int? (FK)&#xa;createdAt: DateTime&#xa;updatedAt: DateTime" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#e1d5e7;strokeColor=#9673a6;align=left;verticalAlign=top;" vertex="1" parent="1">
          <mxGeometry x="400" y="440" width="260" height="240" as="geometry" />
        </mxCell>

        <!-- GoogleCalendarConnection -->
        <mxCell id="googlecalendar" value="GoogleCalendarConnection&#xa;---&#xa;id: Int (PK)&#xa;guestId: Int? (FK, unique)&#xa;adminId: Int? (FK, unique)&#xa;accessToken: String&#xa;refreshToken: String&#xa;tokenExpiry: DateTime&#xa;email: String&#xa;accessStatus: CalendarAccessStatus&#xa;accessRequestedAt: DateTime?&#xa;createdAt: DateTime&#xa;updatedAt: DateTime" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;align=left;verticalAlign=top;" vertex="1" parent="1">
          <mxGeometry x="360" y="720" width="280" height="220" as="geometry" />
        </mxCell>

        <!-- Listing -->
        <mxCell id="listing" value="Listing&#xa;---&#xa;id: Int (PK)&#xa;listingName: String&#xa;price: Float&#xa;availabilities: Json&#xa;remarks: String&#xa;imageUrls: String[]&#xa;vendorId: Int (FK)&#xa;createdAt: DateTime&#xa;updatedAt: DateTime" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#ffe6cc;strokeColor=#d79b00;align=left;verticalAlign=top;" vertex="1" parent="1">
          <mxGeometry x="920" y="40" width="220" height="180" as="geometry" />
        </mxCell>

        <!-- Order -->
        <mxCell id="order" value="Order&#xa;---&#xa;id: Int (PK)&#xa;orderStatus: OrderStatus&#xa;totalAmount: Float&#xa;currency: String&#xa;purchaseDate: DateTime&#xa;remark: String?&#xa;weddingId: Int (FK)&#xa;createdAt: DateTime&#xa;updatedAt: DateTime" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#ffe6cc;strokeColor=#d79b00;align=left;verticalAlign=top;" vertex="1" parent="1">
          <mxGeometry x="720" y="440" width="220" height="180" as="geometry" />
        </mxCell>

        <!-- OrderListing -->
        <mxCell id="orderlisting" value="OrderListing&#xa;---&#xa;orderId: Int (PK, FK)&#xa;listingId: Int (PK, FK)&#xa;bookedSlots: Json&#xa;bookingStatus: OrderStatus&#xa;createdAt: DateTime&#xa;updatedAt: DateTime" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#ffe6cc;strokeColor=#d79b00;align=left;verticalAlign=top;" vertex="1" parent="1">
          <mxGeometry x="980" y="440" width="220" height="140" as="geometry" />
        </mxCell>

        <!-- Review -->
        <mxCell id="review" value="Review&#xa;---&#xa;id: Int (PK)&#xa;rating: Int&#xa;comment: String?&#xa;orderId: Int (FK)&#xa;listingId: Int (FK)&#xa;vendorId: Int (FK)&#xa;adminId: Int (FK)&#xa;createdAt: DateTime&#xa;updatedAt: DateTime" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#ffe6cc;strokeColor=#d79b00;align=left;verticalAlign=top;" vertex="1" parent="1">
          <mxGeometry x="980" y="640" width="220" height="160" as="geometry" />
        </mxCell>

        <!-- Cart -->
        <mxCell id="cart" value="Cart&#xa;---&#xa;id: Int (PK)&#xa;total: Float&#xa;adminId: Int (FK, unique)&#xa;createdAt: DateTime&#xa;updatedAt: DateTime" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#ffe6cc;strokeColor=#d79b00;align=left;verticalAlign=top;" vertex="1" parent="1">
          <mxGeometry x="720" y="720" width="200" height="120" as="geometry" />
        </mxCell>

        <!-- CartItem -->
        <mxCell id="cartitem" value="CartItem&#xa;---&#xa;id: Int (PK)&#xa;cartId: Int (FK)&#xa;listingId: Int (FK)&#xa;selectedSlots: Json" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#ffe6cc;strokeColor=#d79b00;align=left;verticalAlign=top;" vertex="1" parent="1">
          <mxGeometry x="980" y="860" width="200" height="100" as="geometry" />
        </mxCell>

        <!-- Payment -->
        <mxCell id="payment" value="Payment&#xa;---&#xa;id: Int (PK)&#xa;stripeCheckoutSessionId: String (unique)&#xa;stripePaymentIntentId: String?&#xa;amount: Float&#xa;currency: String&#xa;paymentStatus: PaymentStatus&#xa;orderId: Int (FK)&#xa;createdAt: DateTime&#xa;updatedAt: DateTime" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#ffe6cc;strokeColor=#d79b00;align=left;verticalAlign=top;" vertex="1" parent="1">
          <mxGeometry x="1240" y="440" width="260" height="180" as="geometry" />
        </mxCell>

        <!-- VendorEarning -->
        <mxCell id="vendorearning" value="VendorEarning&#xa;---&#xa;id: Int (PK)&#xa;vendorId: Int&#xa;orderListingId: String&#xa;orderId: Int&#xa;listingId: Int&#xa;grossAmount: Float&#xa;platformFee: Float&#xa;netAmount: Float&#xa;currency: String&#xa;isPaidOut: Boolean&#xa;payoutId: Int?&#xa;createdAt: DateTime&#xa;updatedAt: DateTime" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#ffe6cc;strokeColor=#d79b00;align=left;verticalAlign=top;" vertex="1" parent="1">
          <mxGeometry x="1240" y="660" width="220" height="260" as="geometry" />
        </mxCell>

        <!-- VendorPayout -->
        <mxCell id="vendorpayout" value="VendorPayout&#xa;---&#xa;id: Int (PK)&#xa;vendorId: Int&#xa;stripeTransferId: String (unique)&#xa;amount: Float&#xa;currency: String&#xa;status: String&#xa;earningsCount: Int&#xa;periodStart: DateTime&#xa;periodEnd: DateTime&#xa;stripePayoutId: String?&#xa;failureReason: String?&#xa;createdAt: DateTime&#xa;updatedAt: DateTime" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#ffe6cc;strokeColor=#d79b00;align=left;verticalAlign=top;" vertex="1" parent="1">
          <mxGeometry x="1520" y="660" width="240" height="260" as="geometry" />
        </mxCell>

        <!-- DatingPartnerCommission -->
        <mxCell id="datingpartner" value="DatingPartnerCommission&#xa;---&#xa;id: Int (PK)&#xa;adminId: Int&#xa;orderId: Int&#xa;listingId: Int&#xa;grossAmount: Float&#xa;commissionRate: Float&#xa;commissionAmount: Float&#xa;currency: String&#xa;status: String&#xa;stripeTransferId: String? (unique)&#xa;failureReason: String?&#xa;createdAt: DateTime&#xa;updatedAt: DateTime" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#ffe6cc;strokeColor=#d79b00;align=left;verticalAlign=top;" vertex="1" parent="1">
          <mxGeometry x="1520" y="40" width="260" height="260" as="geometry" />
        </mxCell>

        <!-- NotificationDetails -->
        <mxCell id="notification" value="NotificationDetails&#xa;---&#xa;id: Int (PK)&#xa;weddingId: Int? (FK, unique)&#xa;vendorId: Int? (FK, unique)&#xa;isSuperAdminNotification: Boolean?&#xa;createdAt: DateTime&#xa;updatedAt: DateTime" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;align=left;verticalAlign=top;" vertex="1" parent="1">
          <mxGeometry x="40" y="880" width="280" height="140" as="geometry" />
        </mxCell>

        <!-- EmailTemplate -->
        <mxCell id="emailtemplate" value="EmailTemplate&#xa;---&#xa;id: Int (PK)&#xa;name: String&#xa;subject: String&#xa;htmlContent: String&#xa;textContent: String?&#xa;notificationDetailsId: Int (FK)&#xa;createdAt: DateTime&#xa;updatedAt: DateTime" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;align=left;verticalAlign=top;" vertex="1" parent="1">
          <mxGeometry x="40" y="1080" width="260" height="160" as="geometry" />
        </mxCell>

        <!-- EmailNotificationHistory -->
        <mxCell id="emailhistory" value="EmailNotificationHistory&#xa;---&#xa;id: Int (PK)&#xa;to: String[]&#xa;subject: String&#xa;body: String&#xa;sentAt: DateTime&#xa;type: EmailTemplateType&#xa;notificationDetailsId: Int (FK)&#xa;createdAt: DateTime&#xa;updatedAt: DateTime" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;align=left;verticalAlign=top;" vertex="1" parent="1">
          <mxGeometry x="360" y="1080" width="260" height="180" as="geometry" />
        </mxCell>

        <!-- Microsite -->
        <mxCell id="microsite" value="Microsite&#xa;---&#xa;id: Int (PK)&#xa;templateNumber: Int&#xa;slug: String (unique)&#xa;coupleName: String&#xa;heroImages: String[]&#xa;imageGallery: String[]&#xa;schedule: Json?&#xa;faqs: Json?&#xa;password: String?&#xa;weddingId: Int (FK, unique)&#xa;createdAt: DateTime&#xa;updatedAt: DateTime" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;align=left;verticalAlign=top;" vertex="1" parent="1">
          <mxGeometry x="40" y="1300" width="240" height="240" as="geometry" />
        </mxCell>

        <!-- WishlistItem -->
        <mxCell id="wishlist" value="WishlistItem&#xa;---&#xa;id: Int (PK)&#xa;title: String&#xa;itemUrl: String&#xa;isReserved: Boolean&#xa;reservedByName: String?&#xa;weddingId: Int (FK)&#xa;createdAt: DateTime&#xa;updatedAt: DateTime" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;align=left;verticalAlign=top;" vertex="1" parent="1">
          <mxGeometry x="340" y="1300" width="220" height="160" as="geometry" />
        </mxCell>

        <!-- GratitudeCard -->
        <mxCell id="gratitude" value="GratitudeCard&#xa;---&#xa;id: Int (PK)&#xa;signOffName: String&#xa;guestCardMessage: String?&#xa;collaboratorCardMessage: String?&#xa;vendorCardMessage: String?&#xa;guestCardPhotoURL: String?&#xa;collaboratorCardPhotoURL: String?&#xa;weddingId: Int (FK, unique)" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;align=left;verticalAlign=top;" vertex="1" parent="1">
          <mxGeometry x="40" y="1600" width="280" height="160" as="geometry" />
        </mxCell>

        <!-- Album -->
        <mxCell id="album" value="Album&#xa;---&#xa;id: Int (PK)&#xa;coupleName: String&#xa;inviteCardMessage: String&#xa;landingMessage: String&#xa;albumURL: String?&#xa;photos: String[]&#xa;weddingId: Int (FK, unique)&#xa;createdAt: DateTime&#xa;updatedAt: DateTime" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;align=left;verticalAlign=top;" vertex="1" parent="1">
          <mxGeometry x="380" y="1520" width="220" height="180" as="geometry" />
        </mxCell>

        <!-- Photo -->
        <mxCell id="photo" value="Photo&#xa;---&#xa;id: Int (PK)&#xa;url: String&#xa;albumId: Int (FK)&#xa;processingStatus: ProcessingStatus&#xa;processedAt: DateTime?&#xa;isBlurry: Boolean?&#xa;blurScore: Float?&#xa;createdAt: DateTime&#xa;updatedAt: DateTime" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;align=left;verticalAlign=top;" vertex="1" parent="1">
          <mxGeometry x="660" y="1520" width="240" height="180" as="geometry" />
        </mxCell>

        <!-- PhotoFace -->
        <mxCell id="photoface" value="PhotoFace&#xa;---&#xa;id: Int (PK)&#xa;photoId: Int (FK)&#xa;encoding: Json&#xa;x: Float&#xa;y: Float&#xa;width: Float&#xa;height: Float&#xa;personClusterId: Int? (FK)&#xa;createdAt: DateTime" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;align=left;verticalAlign=top;" vertex="1" parent="1">
          <mxGeometry x="960" y="1520" width="220" height="180" as="geometry" />
        </mxCell>

        <!-- PersonCluster -->
        <mxCell id="personcluster" value="PersonCluster&#xa;---&#xa;id: Int (PK)&#xa;albumId: Int (FK)&#xa;label: String?&#xa;representativeEncoding: Json&#xa;thumbnailUrl: String?&#xa;createdAt: DateTime&#xa;updatedAt: DateTime" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;align=left;verticalAlign=top;" vertex="1" parent="1">
          <mxGeometry x="660" y="1760" width="240" height="140" as="geometry" />
        </mxCell>

        <!-- Guestbook -->
        <mxCell id="guestbook" value="Guestbook&#xa;---&#xa;id: Int (PK)&#xa;guestNotes: Json[]&#xa;weddingId: Int (FK, unique)" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;align=left;verticalAlign=top;" vertex="1" parent="1">
          <mxGeometry x="380" y="1760" width="220" height="80" as="geometry" />
        </mxCell>

        <!-- SeatingArrangement -->
        <mxCell id="seating" value="SeatingArrangement&#xa;---&#xa;id: Int (PK)&#xa;weddingId: Int (FK, unique)&#xa;groupPriorities: Json?&#xa;tables: Json&#xa;tablesPerRow: Int?&#xa;createdAt: DateTime&#xa;updatedAt: DateTime" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;align=left;verticalAlign=top;" vertex="1" parent="1">
          <mxGeometry x="40" y="1820" width="240" height="140" as="geometry" />
        </mxCell>

        <!-- Checklist -->
        <mxCell id="checklist" value="Checklist&#xa;---&#xa;id: Int (PK)&#xa;weddingId: Int (FK, unique)&#xa;currentStage: ChatbotStage&#xa;createdAt: DateTime&#xa;updatedAt: DateTime" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;align=left;verticalAlign=top;" vertex="1" parent="1">
          <mxGeometry x="40" y="2020" width="220" height="120" as="geometry" />
        </mxCell>

        <!-- ChecklistItem -->
        <mxCell id="checklistitem" value="ChecklistItem&#xa;---&#xa;id: Int (PK)&#xa;title: String&#xa;description: String&#xa;category: String&#xa;monthsBeforeWedding: Int?&#xa;completed: Boolean&#xa;checklistId: Int (FK)&#xa;createdAt: DateTime&#xa;updatedAt: DateTime" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;align=left;verticalAlign=top;" vertex="1" parent="1">
          <mxGeometry x="320" y="2020" width="220" height="180" as="geometry" />
        </mxCell>

        <!-- ChatMessage -->
        <mxCell id="chatmessage" value="ChatMessage&#xa;---&#xa;id: String (PK)&#xa;role: String&#xa;content: String&#xa;checklistId: Int (FK)&#xa;createdAt: DateTime&#xa;updatedAt: DateTime" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;align=left;verticalAlign=top;" vertex="1" parent="1">
          <mxGeometry x="40" y="2200" width="200" height="140" as="geometry" />
        </mxCell>

        <!-- CashGift -->
        <mxCell id="cashgift" value="CashGift&#xa;---&#xa;id: Int (PK)&#xa;guestId: Int (FK)&#xa;amount: Float&#xa;weddingId: Int (FK)&#xa;createdAt: DateTime&#xa;updatedAt: DateTime" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;align=left;verticalAlign=top;" vertex="1" parent="1">
          <mxGeometry x="700" y="720" width="200" height="140" as="geometry" />
        </mxCell>

        <!-- WeddingWrapped -->
        <mxCell id="weddingwrapped" value="WeddingWrapped&#xa;---&#xa;id: Int (PK)&#xa;weddingId: Int (FK, unique)&#xa;totalInvited: Int&#xa;totalConfirmed: Int&#xa;totalAttended: Int&#xa;firstGuestName: String?&#xa;firstGuestTime: DateTime?&#xa;fastestRsvpName: String?&#xa;fastestRsvpDuration: Int?&#xa;peakTime: DateTime?&#xa;peakGuestCount: Int?&#xa;squadBreakdown: Json&#xa;mostWantedItem: String?&#xa;mostWantedItemCount: Int?&#xa;topContributorName: String?&#xa;topContribution: Float?&#xa;wishlistCompletion: Float&#xa;totalGiftValue: Float&#xa;planningDays: Int&#xa;topVendorCategory: WeddingService?&#xa;topVendorAmount: Float?&#xa;budgetUtilization: Float&#xa;totalSpent: Float&#xa;allocatedBudget: Float&#xa;totalWellWishes: Int&#xa;totalPhotos: Int&#xa;totalFacesDetected: Int&#xa;totalPeopleClusters: Int&#xa;generatedAt: DateTime&#xa;createdAt: DateTime&#xa;updatedAt: DateTime" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;align=left;verticalAlign=top;" vertex="1" parent="1">
          <mxGeometry x="320" y="2260" width="280" height="600" as="geometry" />
        </mxCell>

        <!-- TokenBlacklist -->
        <mxCell id="tokenblacklist" value="TokenBlacklist&#xa;---&#xa;id: Int (PK)&#xa;token: String (unique)&#xa;expiresAt: DateTime&#xa;createdAt: DateTime" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;align=left;verticalAlign=top;" vertex="1" parent="1">
          <mxGeometry x="680" y="1080" width="200" height="100" as="geometry" />
        </mxCell>

        <!-- Relationships -->

        <!-- User to Admin/SuperAdmin/Vendor (1:1) -->
        <mxCell id="user-admin" style="endArrow=classic;html=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;" edge="1" parent="1" source="user" target="admin">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="user-admin-label" value="1:1" style="text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="180" y="200" width="40" height="20" as="geometry" />
        </mxCell>

        <mxCell id="user-superadmin" style="endArrow=classic;html=1;exitX=1;exitY=0.5;entryX=0;entryY=0.5;" edge="1" parent="1" source="user" target="superadmin">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="user-superadmin-label" value="1:1" style="text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="280" y="90" width="40" height="20" as="geometry" />
        </mxCell>

        <mxCell id="user-vendor" style="endArrow=classic;html=1;exitX=1;exitY=0.25;entryX=0;entryY=0.25;" edge="1" parent="1" source="user" target="vendor">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="user-vendor-label" value="1:1" style="text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="480" y="55" width="40" height="20" as="geometry" />
        </mxCell>

        <!-- Admin to Wedding (many-to-many) -->
        <mxCell id="admin-wedding" style="endArrow=classic;html=1;exitX=0.5;exitY=1;entryX=0.25;entryY=0;" edge="1" parent="1" source="admin" target="wedding">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="admin-wedding-label" value="M:N" style="text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="120" y="390" width="40" height="20" as="geometry" />
        </mxCell>

        <!-- Admin to GoogleCalendar (1:1) -->
        <mxCell id="admin-calendar" style="endArrow=classic;html=1;exitX=1;exitY=1;entryX=0;entryY=0.25;" edge="1" parent="1" source="admin" target="googlecalendar">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="admin-calendar-label" value="1:1" style="text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="300" y="370" width="40" height="20" as="geometry" />
        </mxCell>

        <!-- Admin to Cart (1:1) -->
        <mxCell id="admin-cart" style="endArrow=classic;html=1;exitX=1;exitY=0.75;entryX=0;entryY=0.5;" edge="1" parent="1" source="admin" target="cart">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="admin-cart-label" value="1:1" style="text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="620" y="300" width="40" height="20" as="geometry" />
        </mxCell>

        <!-- Admin to Review (1:N) -->
        <mxCell id="admin-review" style="endArrow=classic;html=1;exitX=1;exitY=0.5;entryX=0;entryY=0.75;" edge="1" parent="1" source="admin" target="review">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="admin-review-label" value="1:N" style="text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="900" y="290" width="40" height="20" as="geometry" />
        </mxCell>

        <!-- Wedding to Guest (1:N) -->
        <mxCell id="wedding-guest" style="endArrow=classic;html=1;exitX=1;exitY=0.25;entryX=0;entryY=0.25;" edge="1" parent="1" source="wedding" target="guest">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="wedding-guest-label" value="1:N" style="text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="340" y="490" width="40" height="20" as="geometry" />
        </mxCell>

        <!-- Wedding to Order (1:N) -->
        <mxCell id="wedding-order" style="endArrow=classic;html=1;exitX=1;exitY=0.5;entryX=0;entryY=0.5;" edge="1" parent="1" source="wedding" target="order">
          <mxGeometry relative="1" as="geometry" />
        </mxGeometry>
        <mxCell id="wedding-order-label" value="1:N" style="text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="650" y="510" width="40" height="20" as="geometry" />
        </mxCell>

        <!-- Wedding to Microsite (1:1) -->
        <mxCell id="wedding-microsite" style="endArrow=classic;html=1;exitX=0.25;exitY=1;entryX=0.5;entryY=0;" edge="1" parent="1" source="wedding" target="microsite">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="wedding-microsite-label" value="1:1" style="text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="110" y="1250" width="40" height="20" as="geometry" />
        </mxCell>

        <!-- Wedding to WishlistItem (1:N) -->
        <mxCell id="wedding-wishlist" style="endArrow=classic;html=1;exitX=0.5;exitY=1;entryX=0;entryY=0.25;" edge="1" parent="1" source="wedding" target="wishlist">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="wedding-wishlist-label" value="1:N" style="text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="240" y="1250" width="40" height="20" as="geometry" />
        </mxCell>

        <!-- Wedding to GratitudeCard (1:1) -->
        <mxCell id="wedding-gratitude" style="endArrow=classic;html=1;exitX=0.1;exitY=1;entryX=0.5;entryY=0;" edge="1" parent="1" source="wedding" target="gratitude">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="wedding-gratitude-label" value="1:1" style="text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="110" y="1540" width="40" height="20" as="geometry" />
        </mxCell>

        <!-- Wedding to Album (1:1) -->
        <mxCell id="wedding-album" style="endArrow=classic;html=1;exitX=0.75;exitY=1;entryX=0;entryY=0.25;" edge="1" parent="1" source="wedding" target="album">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="wedding-album-label" value="1:1" style="text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="300" y="1450" width="40" height="20" as="geometry" />
        </mxCell>

        <!-- Wedding to Guestbook (1:1) -->
        <mxCell id="wedding-guestbook" style="endArrow=classic;html=1;exitX=1;exitY=0.9;entryX=0;entryY=0.5;" edge="1" parent="1" source="wedding" target="guestbook">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="wedding-guestbook-label" value="1:1" style="text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="330" y="1770" width="40" height="20" as="geometry" />
        </mxCell>

        <!-- Wedding to SeatingArrangement (1:1) -->
        <mxCell id="wedding-seating" style="endArrow=classic;html=1;exitX=0;exitY=0.9;entryX=1;entryY=0.25;" edge="1" parent="1" source="wedding" target="seating">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="wedding-seating-label" value="1:1" style="text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="0" y="1800" width="40" height="20" as="geometry" />
        </mxCell>

        <!-- Wedding to Checklist (1:1) -->
        <mxCell id="wedding-checklist" style="endArrow=classic;html=1;exitX=0;exitY=1;entryX=1;entryY=0.25;" edge="1" parent="1" source="wedding" target="checklist">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="wedding-checklist-label" value="1:1" style="text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="0" y="2000" width="40" height="20" as="geometry" />
        </mxCell>

        <!-- Wedding to CashGift (1:N) -->
        <mxCell id="wedding-cashgift" style="endArrow=classic;html=1;exitX=1;exitY=0.75;entryX=0;entryY=0.25;" edge="1" parent="1" source="wedding" target="cashgift">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="wedding-cashgift-label" value="1:N" style="text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="620" y="700" width="40" height="20" as="geometry" />
        </mxCell>

        <!-- Wedding to WeddingWrapped (1:1) -->
        <mxCell id="wedding-wrapped" style="endArrow=classic;html=1;exitX=0.5;exitY=1;entryX=0;entryY=0.1;" edge="1" parent="1" source="wedding" target="weddingwrapped">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="wedding-wrapped-label" value="1:1" style="text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="240" y="2200" width="40" height="20" as="geometry" />
        </mxCell>

        <!-- Wedding to NotificationDetails (1:1) -->
        <mxCell id="wedding-notification" style="endArrow=classic;html=1;exitX=0.25;exitY=1;entryX=0.75;entryY=0;" edge="1" parent="1" source="wedding" target="notification">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="wedding-notification-label" value="1:1" style="text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="180" y="840" width="40" height="20" as="geometry" />
        </mxCell>

        <!-- Guest to GoogleCalendar (1:1) -->
        <mxCell id="guest-calendar" style="endArrow=classic;html=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;" edge="1" parent="1" source="guest" target="googlecalendar">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="guest-calendar-label" value="1:1" style="text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="510" y="690" width="40" height="20" as="geometry" />
        </mxCell>

        <!-- Guest to CashGift (1:N) -->
        <mxCell id="guest-cashgift" style="endArrow=classic;html=1;exitX=1;exitY=0.75;entryX=0.5;entryY=0;" edge="1" parent="1" source="guest" target="cashgift">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="guest-cashgift-label" value="1:N" style="text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="710" y="660" width="40" height="20" as="geometry" />
        </mxCell>

        <!-- Guest self-reference (primaryGuest) -->
        <mxCell id="guest-guest" style="endArrow=classic;html=1;exitX=1;exitY=0.5;entryX=1;entryY=0.25;" edge="1" parent="1" source="guest" target="guest">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="700" y="560" />
              <mxPoint x="700" y="500" />
            </Array>
          </mxGeometry>
        </mxCell>
        <mxCell id="guest-guest-label" value="1:N (primaryGuest)" style="text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="690" y="520" width="120" height="20" as="geometry" />
        </mxCell>

        <!-- Vendor to Listing (1:N) -->
        <mxCell id="vendor-listing" style="endArrow=classic;html=1;exitX=1;exitY=0.25;entryX=0;entryY=0.5;" edge="1" parent="1" source="vendor" target="listing">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="vendor-listing-label" value="1:N" style="text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="870" y="110" width="40" height="20" as="geometry" />
        </mxCell>

        <!-- Vendor to Review (1:N) -->
        <mxCell id="vendor-review" style="endArrow=classic;html=1;exitX=1;exitY=0.75;entryX=0.5;entryY=0;" edge="1" parent="1" source="vendor" target="review">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="vendor-review-label" value="1:N" style="text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="1030" y="380" width="40" height="20" as="geometry" />
        </mxCell>

        <!-- Vendor to NotificationDetails (1:1) -->
        <mxCell id="vendor-notification" style="endArrow=classic;html=1;exitX=0;exitY=0.75;entryX=1;entryY=0.25;" edge="1" parent="1" source="vendor" target="notification">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="vendor-notification-label" value="1:1" style="text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="480" y="880" width="40" height="20" as="geometry" />
        </mxCell>

        <!-- Order to OrderListing (1:N) -->
        <mxCell id="order-orderlisting" style="endArrow=classic;html=1;exitX=1;exitY=0.5;entryX=0;entryY=0.5;" edge="1" parent="1" source="order" target="orderlisting">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="order-orderlisting-label" value="1:N" style="text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="940" y="500" width="40" height="20" as="geometry" />
        </mxCell>

        <!-- Order to Payment (1:N) -->
        <mxCell id="order-payment" style="endArrow=classic;html=1;exitX=1;exitY=0.25;entryX=0;entryY=0.5;" edge="1" parent="1" source="order" target="payment">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="order-payment-label" value="1:N" style="text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="1160" y="510" width="40" height="20" as="geometry" />
        </mxCell>

        <!-- Listing to OrderListing (1:N) -->
        <mxCell id="listing-orderlisting" style="endArrow=classic;html=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;" edge="1" parent="1" source="listing" target="orderlisting">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="listing-orderlisting-label" value="1:N" style="text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="1050" y="380" width="40" height="20" as="geometry" />
        </mxCell>

        <!-- Listing to CartItem (1:N) -->
        <mxCell id="listing-cartitem" style="endArrow=classic;html=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;" edge="1" parent="1" source="listing" target="cartitem">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="listing-cartitem-label" value="1:N" style="text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="1050" y="820" width="40" height="20" as="geometry" />
        </mxCell>

        <!-- OrderListing to Review (1:1) -->
        <mxCell id="orderlisting-review" style="endArrow=classic;html=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;" edge="1" parent="1" source="orderlisting" target="review">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="orderlisting-review-label" value="1:1" style="text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="1090" y="600" width="40" height="20" as="geometry" />
        </mxCell>

        <!-- Cart to CartItem (1:N) -->
        <mxCell id="cart-cartitem" style="endArrow=classic;html=1;exitX=1;exitY=0.75;entryX=0;entryY=0.5;" edge="1" parent="1" source="cart" target="cartitem">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="cart-cartitem-label" value="1:N" style="text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="930" y="880" width="40" height="20" as="geometry" />
        </mxCell>

        <!-- NotificationDetails to EmailTemplate (1:N) -->
        <mxCell id="notification-template" style="endArrow=classic;html=1;exitX=0.25;exitY=1;entryX=0.5;entryY=0;" edge="1" parent="1" source="notification" target="emailtemplate">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="notification-template-label" value="1:N" style="text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="120" y="1040" width="40" height="20" as="geometry" />
        </mxCell>

        <!-- NotificationDetails to EmailNotificationHistory (1:N) -->
        <mxCell id="notification-history" style="endArrow=classic;html=1;exitX=0.75;exitY=1;entryX=0.25;entryY=0;" edge="1" parent="1" source="notification" target="emailhistory">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="notification-history-label" value="1:N" style="text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="300" y="1040" width="40" height="20" as="geometry" />
        </mxCell>

        <!-- Album to Photo (1:N) -->
        <mxCell id="album-photo" style="endArrow=classic;html=1;exitX=1;exitY=0.5;entryX=0;entryY=0.5;" edge="1" parent="1" source="album" target="photo">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="album-photo-label" value="1:N" style="text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="610" y="1600" width="40" height="20" as="geometry" />
        </mxCell>

        <!-- Album to PersonCluster (1:N) -->
        <mxCell id="album-cluster" style="endArrow=classic;html=1;exitX=0.75;exitY=1;entryX=0;entryY=0.5;" edge="1" parent="1" source="album" target="personcluster">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="album-cluster-label" value="1:N" style="text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="580" y="1780" width="40" height="20" as="geometry" />
        </mxCell>

        <!-- Photo to PhotoFace (1:N) -->
        <mxCell id="photo-face" style="endArrow=classic;html=1;exitX=1;exitY=0.5;entryX=0;entryY=0.5;" edge="1" parent="1" source="photo" target="photoface">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="photo-face-label" value="1:N" style="text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="910" y="1600" width="40" height="20" as="geometry" />
        </mxCell>

        <!-- PersonCluster to PhotoFace (1:N) -->
        <mxCell id="cluster-face" style="endArrow=classic;html=1;exitX=1;exitY=0.5;entryX=0.25;entryY=1;" edge="1" parent="1" source="personcluster" target="photoface">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="cluster-face-label" value="1:N" style="text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="930" y="1810" width="40" height="20" as="geometry" />
        </mxCell>

        <!-- Checklist to ChecklistItem (1:N) -->
        <mxCell id="checklist-item" style="endArrow=classic;html=1;exitX=1;exitY=0.5;entryX=0;entryY=0.5;" edge="1" parent="1" source="checklist" target="checklistitem">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="checklist-item-label" value="1:N" style="text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="270" y="2070" width="40" height="20" as="geometry" />
        </mxCell>

        <!-- Checklist to ChatMessage (1:N) -->
        <mxCell id="checklist-chat" style="endArrow=classic;html=1;exitX=0.25;exitY=1;entryX=0.5;entryY=0;" edge="1" parent="1" source="checklist" target="chatmessage">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="checklist-chat-label" value="1:N" style="text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="100" y="2160" width="40" height="20" as="geometry" />
        </mxCell>

        <!-- Legend -->
        <mxCell id="legend" value="LEGEND&#xa;---&#xa;PK = Primary Key&#xa;FK = Foreign Key&#xa;1:1 = One-to-One&#xa;1:N = One-to-Many&#xa;M:N = Many-to-Many&#xa;&#xa;Color Code:&#xa;Blue = User/Auth&#xa;Green = User Roles&#xa;Yellow = Wedding/Features&#xa;Orange = Marketplace&#xa;Purple = Guest&#xa;Red = Calendar&#xa;Gray = Notifications/System" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;align=left;verticalAlign=top;fontStyle=1" vertex="1" parent="1">
          <mxGeometry x="1520" y="1520" width="240" height="240" as="geometry" />
        </mxCell>

        <!-- Additional note -->
        <mxCell id="note" value="Wedding Management System&#xa;Entity Relationship Diagram&#xa;&#xa;Total Models: 35&#xa;Core Entities: User, Admin, Vendor, Wedding, Guest&#xa;Features: Microsite, Album, Wishlist, Guestbook, &#xa;Checklist, Seating, Cash Gifts, Reviews, Orders&#xa;Enhanced: Photo Analysis with Face Detection&#xa;and Person Clustering" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;align=center;verticalAlign=top;fontStyle=1;fontSize=14" vertex="1" parent="1">
          <mxGeometry x="680" y="2260" width="400" height="200" as="geometry" />
        </mxCell>

      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
