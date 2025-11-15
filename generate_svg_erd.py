#!/usr/bin/env python3
"""
Generate SVG Entity Relationship Diagram from Prisma Schema with straight arrows
"""

# Define all models with their fields and positions (with proper spacing to avoid overlaps)
models = {
    # Row 1 - User/Auth (y=100)
    'User': {
        'color': '#DAE8FC',
        'fields': ['id: Int (PK)', 'name: String', 'email: String (unique)', 'password: String', 'role: UserRole'],
        'pos': (50, 100)
    },
    'SuperAdmin': {
        'color': '#D5E8D4',
        'fields': ['userId: Int (PK, FK)'],
        'pos': (400, 100)
    },
    'Vendor': {
        'color': '#D5E8D4',
        'fields': ['userId: Int (PK, FK)', 'rating: Float', 'serviceOffered: WeddingService', 'onboardingStatus: VendorOnboardingStatus', 'stripeConnectAccountId: String'],
        'pos': (750, 100)
    },
    'Listing': {
        'color': '#FFE6CC',
        'fields': ['id: Int (PK)', 'listingName: String', 'price: Float', 'vendorId: Int (FK)'],
        'pos': (1150, 100)
    },

    # Row 2 - Roles (y=320)
    'Admin': {
        'color': '#D5E8D4',
        'fields': ['userId: Int (PK, FK)', 'isSuspended: Boolean', 'isDatingPartnerRegistered: Boolean', 'mainWeddingId: Int (FK)'],
        'pos': (50, 320)
    },
    'Cart': {
        'color': '#FFE6CC',
        'fields': ['id: Int (PK)', 'total: Float', 'adminId: Int (FK)'],
        'pos': (400, 320)
    },
    'GoogleCalendarConnection': {
        'color': '#F8CECC',
        'fields': ['id: Int (PK)', 'adminId: Int (FK)', 'guestId: Int (FK)', 'accessToken: String', 'accessStatus: CalendarAccessStatus'],
        'pos': (750, 320)
    },

    # Row 3 - Orders/Cart (y=520)
    'CartItem': {
        'color': '#FFE6CC',
        'fields': ['id: Int (PK)', 'cartId: Int (FK)', 'listingId: Int (FK)', 'selectedSlots: Json'],
        'pos': (400, 520)
    },
    'OrderListing': {
        'color': '#FFE6CC',
        'fields': ['orderId: Int (PK, FK)', 'listingId: Int (PK, FK)', 'bookedSlots: Json', 'bookingStatus: OrderStatus'],
        'pos': (750, 520)
    },
    'Review': {
        'color': '#FFE6CC',
        'fields': ['id: Int (PK)', 'rating: Int', 'vendorId: Int (FK)', 'adminId: Int (FK)', 'orderId: Int (FK)', 'listingId: Int (FK)'],
        'pos': (1150, 520)
    },
    'Payment': {
        'color': '#FFE6CC',
        'fields': ['id: Int (PK)', 'stripeCheckoutSessionId: String', 'amount: Float', 'orderId: Int (FK)'],
        'pos': (1550, 520)
    },

    # Row 4 - Wedding/Guest (y=750)
    'Wedding': {
        'color': '#FFF2CC',
        'fields': ['id: Int (PK)', 'name: String', 'date: DateTime', 'location: String', 'allocatedBudget: Float', 'weddingType: WeddingType'],
        'pos': (50, 750)
    },
    'Guest': {
        'color': '#E1D5E7',
        'fields': ['id: Int (PK)', 'name: String', 'email: String', 'confirmationStatus: ConfirmationStatus', 'weddingId: Int (FK)', 'primaryGuestId: Int (FK)'],
        'pos': (400, 750)
    },
    'CashGift': {
        'color': '#FFF2CC',
        'fields': ['id: Int (PK)', 'guestId: Int (FK)', 'amount: Float', 'weddingId: Int (FK)'],
        'pos': (750, 750)
    },
    'Order': {
        'color': '#FFE6CC',
        'fields': ['id: Int (PK)', 'orderStatus: OrderStatus', 'totalAmount: Float', 'weddingId: Int (FK)'],
        'pos': (1150, 750)
    },
    'VendorEarning': {
        'color': '#FFE6CC',
        'fields': ['id: Int (PK)', 'vendorId: Int', 'orderId: Int', 'grossAmount: Float', 'platformFee: Float'],
        'pos': (1550, 750)
    },

    # Row 5 - Vendor Payments (y=980)
    'VendorPayout': {
        'color': '#FFE6CC',
        'fields': ['id: Int (PK)', 'vendorId: Int', 'stripeTransferId: String', 'amount: Float'],
        'pos': (1150, 980)
    },
    'DatingPartnerCommission': {
        'color': '#FFE6CC',
        'fields': ['id: Int (PK)', 'adminId: Int', 'orderId: Int', 'commissionAmount: Float'],
        'pos': (1550, 980)
    },

    # Row 6 - Notifications (y=1180)
    'NotificationDetails': {
        'color': '#F5F5F5',
        'fields': ['id: Int (PK)', 'weddingId: Int (FK)', 'vendorId: Int (FK)'],
        'pos': (50, 1180)
    },
    'EmailTemplate': {
        'color': '#F5F5F5',
        'fields': ['id: Int (PK)', 'name: String', 'subject: String', 'notificationDetailsId: Int (FK)'],
        'pos': (400, 1180)
    },
    'EmailNotificationHistory': {
        'color': '#F5F5F5',
        'fields': ['id: Int (PK)', 'to: String[]', 'subject: String', 'type: EmailTemplateType', 'notificationDetailsId: Int (FK)'],
        'pos': (750, 1180)
    },
    'TokenBlacklist': {
        'color': '#F5F5F5',
        'fields': ['id: Int (PK)', 'token: String (unique)', 'expiresAt: DateTime'],
        'pos': (1150, 1180)
    },

    # Row 7 - Wedding Features 1 (y=1410)
    'Microsite': {
        'color': '#FFF2CC',
        'fields': ['id: Int (PK)', 'slug: String (unique)', 'coupleName: String', 'weddingId: Int (FK)'],
        'pos': (50, 1410)
    },
    'WishlistItem': {
        'color': '#FFF2CC',
        'fields': ['id: Int (PK)', 'title: String', 'itemUrl: String', 'isReserved: Boolean', 'weddingId: Int (FK)'],
        'pos': (400, 1410)
    },
    'Guestbook': {
        'color': '#FFF2CC',
        'fields': ['id: Int (PK)', 'guestNotes: Json[]', 'weddingId: Int (FK)'],
        'pos': (750, 1410)
    },
    'SeatingArrangement': {
        'color': '#FFF2CC',
        'fields': ['id: Int (PK)', 'weddingId: Int (FK)', 'tables: Json', 'groupPriorities: Json'],
        'pos': (1150, 1410)
    },

    # Row 8 - Wedding Features 2 (y=1640)
    'GratitudeCard': {
        'color': '#FFF2CC',
        'fields': ['id: Int (PK)', 'signOffName: String', 'guestCardMessage: String', 'weddingId: Int (FK)'],
        'pos': (50, 1640)
    },
    'Album': {
        'color': '#FFF2CC',
        'fields': ['id: Int (PK)', 'coupleName: String', 'albumURL: String', 'weddingId: Int (FK)'],
        'pos': (400, 1640)
    },
    'Photo': {
        'color': '#FFF2CC',
        'fields': ['id: Int (PK)', 'url: String', 'albumId: Int (FK)', 'processingStatus: ProcessingStatus', 'isBlurry: Boolean'],
        'pos': (750, 1640)
    },
    'PhotoFace': {
        'color': '#FFF2CC',
        'fields': ['id: Int (PK)', 'photoId: Int (FK)', 'encoding: Json', 'x, y, width, height: Float', 'personClusterId: Int (FK)'],
        'pos': (1150, 1640)
    },
    'PersonCluster': {
        'color': '#FFF2CC',
        'fields': ['id: Int (PK)', 'albumId: Int (FK)', 'label: String', 'representativeEncoding: Json'],
        'pos': (1550, 1640)
    },

    # Row 9 - Checklist (y=1870)
    'Checklist': {
        'color': '#FFF2CC',
        'fields': ['id: Int (PK)', 'weddingId: Int (FK)', 'currentStage: ChatbotStage'],
        'pos': (50, 1870)
    },
    'ChecklistItem': {
        'color': '#FFF2CC',
        'fields': ['id: Int (PK)', 'title: String', 'category: String', 'completed: Boolean', 'checklistId: Int (FK)'],
        'pos': (400, 1870)
    },
    'ChatMessage': {
        'color': '#FFF2CC',
        'fields': ['id: String (PK)', 'role: String', 'content: String', 'checklistId: Int (FK)'],
        'pos': (750, 1870)
    },
    'WeddingWrapped': {
        'color': '#FFF2CC',
        'fields': ['id: Int (PK)', 'weddingId: Int (FK)', 'totalInvited: Int', 'totalConfirmed: Int', 'topContributorName: String'],
        'pos': (1150, 1870)
    },
}

# Define relationships with direction types
# Type: 'one' (→), 'many' (←), 'bidirectional' (↔)
relationships = [
    # User relationships
    {'from': 'User', 'to': 'Admin', 'label': '1:1', 'type': 'one'},
    {'from': 'User', 'to': 'SuperAdmin', 'label': '1:1', 'type': 'one'},
    {'from': 'User', 'to': 'Vendor', 'label': '1:1', 'type': 'one'},

    # Admin relationships
    {'from': 'Admin', 'to': 'Wedding', 'label': 'M:N', 'type': 'bidirectional'},
    {'from': 'Admin', 'to': 'GoogleCalendarConnection', 'label': '1:1', 'type': 'one'},
    {'from': 'Admin', 'to': 'Cart', 'label': '1:1', 'type': 'one'},
    {'from': 'Admin', 'to': 'Review', 'label': '1:N', 'type': 'one'},

    # Wedding relationships
    {'from': 'Wedding', 'to': 'Guest', 'label': '1:N', 'type': 'one'},
    {'from': 'Wedding', 'to': 'Order', 'label': '1:N', 'type': 'one'},
    {'from': 'Wedding', 'to': 'NotificationDetails', 'label': '1:1', 'type': 'one'},
    {'from': 'Wedding', 'to': 'Microsite', 'label': '1:1', 'type': 'one'},
    {'from': 'Wedding', 'to': 'WishlistItem', 'label': '1:N', 'type': 'one'},
    {'from': 'Wedding', 'to': 'GratitudeCard', 'label': '1:1', 'type': 'one'},
    {'from': 'Wedding', 'to': 'Album', 'label': '1:1', 'type': 'one'},
    {'from': 'Wedding', 'to': 'Guestbook', 'label': '1:1', 'type': 'one'},
    {'from': 'Wedding', 'to': 'SeatingArrangement', 'label': '1:1', 'type': 'one'},
    {'from': 'Wedding', 'to': 'Checklist', 'label': '1:1', 'type': 'one'},
    {'from': 'Wedding', 'to': 'CashGift', 'label': '1:N', 'type': 'one'},
    {'from': 'Wedding', 'to': 'WeddingWrapped', 'label': '1:1', 'type': 'one'},

    # Guest relationships
    {'from': 'Guest', 'to': 'GoogleCalendarConnection', 'label': '1:1', 'type': 'one'},
    {'from': 'Guest', 'to': 'CashGift', 'label': '1:N', 'type': 'one'},
    {'from': 'Guest', 'to': 'Guest', 'label': '1:N', 'type': 'one'},

    # Vendor relationships
    {'from': 'Vendor', 'to': 'Listing', 'label': '1:N', 'type': 'one'},
    {'from': 'Vendor', 'to': 'Review', 'label': '1:N', 'type': 'one'},
    {'from': 'Vendor', 'to': 'NotificationDetails', 'label': '1:1', 'type': 'one'},

    # Order/Listing relationships
    {'from': 'Order', 'to': 'OrderListing', 'label': '1:N', 'type': 'one'},
    {'from': 'Listing', 'to': 'OrderListing', 'label': '1:N', 'type': 'one'},
    {'from': 'Order', 'to': 'Payment', 'label': '1:N', 'type': 'one'},
    {'from': 'OrderListing', 'to': 'Review', 'label': '1:1', 'type': 'one'},

    # Cart relationships
    {'from': 'Cart', 'to': 'CartItem', 'label': '1:N', 'type': 'one'},
    {'from': 'Listing', 'to': 'CartItem', 'label': '1:N', 'type': 'one'},

    # Notification relationships
    {'from': 'NotificationDetails', 'to': 'EmailTemplate', 'label': '1:N', 'type': 'one'},
    {'from': 'NotificationDetails', 'to': 'EmailNotificationHistory', 'label': '1:N', 'type': 'one'},

    # Album/Photo relationships
    {'from': 'Album', 'to': 'Photo', 'label': '1:N', 'type': 'one'},
    {'from': 'Album', 'to': 'PersonCluster', 'label': '1:N', 'type': 'one'},
    {'from': 'Photo', 'to': 'PhotoFace', 'label': '1:N', 'type': 'one'},
    {'from': 'PersonCluster', 'to': 'PhotoFace', 'label': '1:N', 'type': 'one'},

    # Checklist relationships
    {'from': 'Checklist', 'to': 'ChecklistItem', 'label': '1:N', 'type': 'one'},
    {'from': 'Checklist', 'to': 'ChatMessage', 'label': '1:N', 'type': 'one'},
]

def get_center(model_name):
    """Get center point of a model box"""
    x, y = models[model_name]['pos']
    fields = models[model_name]['fields']
    height = 60 + len(fields) * 20
    width = 280
    return x + width // 2, y + height // 2

def create_svg():
    # Calculate SVG dimensions
    max_x = max(m['pos'][0] + 280 for m in models.values())
    max_y = max(m['pos'][1] + 100 + len(m['fields']) * 20 for m in models.values())

    svg_width = max_x + 100
    svg_height = max_y + 200

    svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="{svg_width}" height="{svg_height}" viewBox="0 0 {svg_width} {svg_height}">
    <defs>
        <!-- Arrow markers -->
        <marker id="arrow-one" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#333" />
        </marker>
        <marker id="arrow-bidirectional-start" markerWidth="10" markerHeight="10" refX="1" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M9,0 L9,6 L0,3 z" fill="#333" />
        </marker>
        <marker id="arrow-bidirectional-end" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#333" />
        </marker>
    </defs>

    <!-- Background -->
    <rect width="{svg_width}" height="{svg_height}" fill="#ffffff"/>

    <!-- Title -->
    <text x="{svg_width//2}" y="30" font-family="Arial" font-size="24" font-weight="bold" text-anchor="middle" fill="#2c3e50">
        Wedding Management System - Entity Relationship Diagram
    </text>
    <text x="{svg_width//2}" y="55" font-family="Arial" font-size="14" text-anchor="middle" fill="#7f8c8d">
        Total Models: 35 | All Relationships Mapped
    </text>

'''

    # Draw relationships first (so they appear behind boxes)
    svg += '    <!-- Relationships -->\n'
    for rel in relationships:
        from_name = rel['from']
        to_name = rel['to']

        # Skip self-reference for Guest (we'll handle it specially)
        if from_name == to_name:
            x, y = models[from_name]['pos']
            cx = x + 280
            cy = y + 60

            svg += f'''    <path d="M {cx},{cy} L {cx + 40},{cy} L {cx + 40},{cy + 40} L {cx},{cy + 40}"
                  stroke="#333" stroke-width="2" fill="none" marker-end="url(#arrow-one)"/>
    <text x="{cx + 50}" y="{cy + 20}" font-family="Arial" font-size="11" fill="#333">{rel['label']}</text>
'''
            continue

        x1, y1 = get_center(from_name)
        x2, y2 = get_center(to_name)

        # Determine marker based on type
        if rel['type'] == 'bidirectional':
            marker = 'marker-start="url(#arrow-bidirectional-start)" marker-end="url(#arrow-bidirectional-end)"'
            stroke_dasharray = 'stroke-dasharray="5,5"'
        else:
            marker = 'marker-end="url(#arrow-one)"'
            stroke_dasharray = ''

        # Calculate label position (midpoint)
        label_x = (x1 + x2) // 2
        label_y = (y1 + y2) // 2 - 5

        svg += f'''    <line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}"
              stroke="#333" stroke-width="2" {marker} {stroke_dasharray}/>
    <text x="{label_x}" y="{label_y}" font-family="Arial" font-size="11" fill="#333" text-anchor="middle"
          style="background: white; padding: 2px;">{rel['label']}</text>
'''

    # Draw model boxes
    svg += '\n    <!-- Model Boxes -->\n'
    for model_name, model_data in models.items():
        x, y = model_data['pos']
        color = model_data['color']
        fields = model_data['fields']

        # Calculate box height based on number of fields
        box_height = 60 + len(fields) * 20
        box_width = 280

        # Draw box
        svg += f'''    <!-- {model_name} -->
    <rect x="{x}" y="{y}" width="{box_width}" height="{box_height}"
          fill="{color}" stroke="#333" stroke-width="2" rx="5"/>
    <rect x="{x}" y="{y}" width="{box_width}" height="30"
          fill="{color}" stroke="#333" stroke-width="2" rx="5"/>
    <text x="{x + box_width//2}" y="{y + 20}" font-family="Arial" font-size="14"
          font-weight="bold" text-anchor="middle" fill="#000">{model_name}</text>
    <line x1="{x}" y1="{y + 30}" x2="{x + box_width}" y2="{y + 30}" stroke="#333" stroke-width="2"/>
'''

        # Draw fields
        for i, field in enumerate(fields):
            field_y = y + 50 + i * 20
            svg += f'''    <text x="{x + 10}" y="{field_y}" font-family="Monaco, Courier New, monospace"
          font-size="10" fill="#000">{field}</text>
'''

    # Add legend
    legend_x = svg_width - 320
    legend_y = 100

    svg += f'''
    <!-- Legend -->
    <rect x="{legend_x}" y="{legend_y}" width="300" height="420" fill="#FFFACD" stroke="#333" stroke-width="2" rx="5"/>
    <text x="{legend_x + 150}" y="{legend_y + 25}" font-family="Arial" font-size="16" font-weight="bold"
          text-anchor="middle" fill="#000">LEGEND</text>
    <line x1="{legend_x + 10}" y1="{legend_y + 35}" x2="{legend_x + 290}" y2="{legend_y + 35}" stroke="#333" stroke-width="1"/>

    <text x="{legend_x + 10}" y="{legend_y + 55}" font-family="Arial" font-size="12" font-weight="bold" fill="#000">Color Code:</text>
    <rect x="{legend_x + 10}" y="{legend_y + 65}" width="20" height="20" fill="#DAE8FC" stroke="#333"/>
    <text x="{legend_x + 35}" y="{legend_y + 80}" font-family="Arial" font-size="11" fill="#000">User/Auth</text>

    <rect x="{legend_x + 10}" y="{legend_y + 95}" width="20" height="20" fill="#D5E8D4" stroke="#333"/>
    <text x="{legend_x + 35}" y="{legend_y + 110}" font-family="Arial" font-size="11" fill="#000">User Roles (Admin, Vendor)</text>

    <rect x="{legend_x + 10}" y="{legend_y + 125}" width="20" height="20" fill="#FFF2CC" stroke="#333"/>
    <text x="{legend_x + 35}" y="{legend_y + 140}" font-family="Arial" font-size="11" fill="#000">Wedding Features</text>

    <rect x="{legend_x + 10}" y="{legend_y + 155}" width="20" height="20" fill="#FFE6CC" stroke="#333"/>
    <text x="{legend_x + 35}" y="{legend_y + 170}" font-family="Arial" font-size="11" fill="#000">Marketplace/Orders</text>

    <rect x="{legend_x + 10}" y="{legend_y + 185}" width="20" height="20" fill="#E1D5E7" stroke="#333"/>
    <text x="{legend_x + 35}" y="{legend_y + 200}" font-family="Arial" font-size="11" fill="#000">Guest</text>

    <rect x="{legend_x + 10}" y="{legend_y + 215}" width="20" height="20" fill="#F8CECC" stroke="#333"/>
    <text x="{legend_x + 35}" y="{legend_y + 230}" font-family="Arial" font-size="11" fill="#000">Calendar</text>

    <rect x="{legend_x + 10}" y="{legend_y + 245}" width="20" height="20" fill="#F5F5F5" stroke="#333"/>
    <text x="{legend_x + 35}" y="{legend_y + 260}" font-family="Arial" font-size="11" fill="#000">System/Notifications</text>

    <line x1="{legend_x + 10}" y1="{legend_y + 275}" x2="{legend_x + 290}" y2="{legend_y + 275}" stroke="#333" stroke-width="1"/>

    <text x="{legend_x + 10}" y="{legend_y + 295}" font-family="Arial" font-size="12" font-weight="bold" fill="#000">Relationships:</text>

    <line x1="{legend_x + 10}" y1="{legend_y + 310}" x2="{legend_x + 50}" y2="{legend_y + 310}"
          stroke="#333" stroke-width="2" marker-end="url(#arrow-one)"/>
    <text x="{legend_x + 60}" y="{legend_y + 315}" font-family="Arial" font-size="11" fill="#000">One-to-One (1:1)</text>

    <line x1="{legend_x + 10}" y1="{legend_y + 335}" x2="{legend_x + 50}" y2="{legend_y + 335}"
          stroke="#333" stroke-width="2" marker-end="url(#arrow-one)"/>
    <text x="{legend_x + 60}" y="{legend_y + 340}" font-family="Arial" font-size="11" fill="#000">One-to-Many (1:N)</text>

    <line x1="{legend_x + 10}" y1="{legend_y + 360}" x2="{legend_x + 50}" y2="{legend_y + 360}"
          stroke="#333" stroke-width="2" stroke-dasharray="5,5"
          marker-start="url(#arrow-bidirectional-start)" marker-end="url(#arrow-bidirectional-end)"/>
    <text x="{legend_x + 60}" y="{legend_y + 365}" font-family="Arial" font-size="11" fill="#000">Many-to-Many (M:N)</text>

    <line x1="{legend_x + 10}" y1="{legend_y + 380}" x2="{legend_x + 290}" y2="{legend_y + 380}" stroke="#333" stroke-width="1"/>

    <text x="{legend_x + 10}" y="{legend_y + 400}" font-family="Arial" font-size="10" fill="#555">PK = Primary Key</text>
    <text x="{legend_x + 150}" y="{legend_y + 400}" font-family="Arial" font-size="10" fill="#555">FK = Foreign Key</text>

</svg>'''

    return svg

# Generate and save SVG
svg_content = create_svg()
with open('wedding_management_erd.svg', 'w') as f:
    f.write(svg_content)

print("SVG ERD diagram generated successfully: wedding_management_erd.svg")
print("Features: Straight arrows, directional indicators, color-coded entities")
