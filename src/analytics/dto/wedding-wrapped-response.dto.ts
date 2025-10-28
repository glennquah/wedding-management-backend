import { ApiProperty } from '@nestjs/swagger';
import { WeddingService } from '@prisma/client';

export class SquadBreakdownItem {
  @ApiProperty({
    description: 'Guest group name',
    example: 'Family',
  })
  group: string;

  @ApiProperty({
    description: 'Number of guests in this group',
    example: 45,
  })
  count: number;
}

export class GuestInsights {
  @ApiProperty({
    description: 'Total number of guests invited',
    example: 150,
  })
  totalInvited: number;

  @ApiProperty({
    description: 'Total number of guests confirmed',
    example: 130,
  })
  totalConfirmed: number;

  @ApiProperty({
    description: 'Total number of guests who attended',
    example: 125,
  })
  totalAttended: number;

  @ApiProperty({
    description: 'Name of the first guest to arrive',
    example: 'John Doe',
    nullable: true,
  })
  firstGuestName?: string;

  @ApiProperty({
    description: 'Time when the first guest checked in',
    example: '2024-06-15T14:30:00Z',
    nullable: true,
  })
  firstGuestTime?: Date;

  @ApiProperty({
    description: 'Name of guest with fastest RSVP response',
    example: 'Jane Smith',
    nullable: true,
  })
  fastestRsvpName?: string;

  @ApiProperty({
    description: 'Duration in hours for fastest RSVP response',
    example: 2,
    nullable: true,
  })
  fastestRsvpDuration?: number;

  @ApiProperty({
    description: 'Time when most guests were present',
    example: '2024-06-15T18:00:00Z',
    nullable: true,
  })
  peakTime?: Date;

  @ApiProperty({
    description: 'Number of guests present at peak time',
    example: 120,
    nullable: true,
  })
  peakGuestCount?: number;

  @ApiProperty({
    description: 'Breakdown of guests by group/relationship',
    type: [SquadBreakdownItem],
  })
  squadBreakdown: SquadBreakdownItem[];
}

export class GiftSupportInsights {
  @ApiProperty({
    description: 'Most popular wishlist item',
    example: 'Honeymoon Fund',
    nullable: true,
  })
  mostWantedItem?: string;

  @ApiProperty({
    description: 'Number of reservations for most wanted item',
    example: 15,
    nullable: true,
  })
  mostWantedItemCount?: number;

  @ApiProperty({
    description: 'Name of guest with highest contribution',
    example: 'Anonymous',
    nullable: true,
  })
  topContributorName?: string;

  @ApiProperty({
    description: 'Amount of highest contribution',
    example: 500.0,
    nullable: true,
  })
  topContribution?: number;

  @ApiProperty({
    description: 'Wishlist completion percentage',
    example: 87.5,
  })
  wishlistCompletion: number;

  @ApiProperty({
    description: 'Total value of gifts and support received',
    example: 12500.0,
  })
  totalGiftValue: number;
}

export class PlanningJourneyInsights {
  @ApiProperty({
    description: 'Number of days spent planning the wedding',
    example: 180,
  })
  planningDays: number;

  @ApiProperty({
    description: 'Vendor category with highest spending',
    example: 'VENUE',
    enum: WeddingService,
    nullable: true,
  })
  topVendorCategory?: WeddingService;

  @ApiProperty({
    description: 'Amount spent on top vendor category',
    example: 15000.0,
    nullable: true,
  })
  topVendorAmount?: number;

  @ApiProperty({
    description: 'Budget utilization percentage',
    example: 92.3,
  })
  budgetUtilization: number;

  @ApiProperty({
    description: 'Total amount spent',
    example: 46150.0,
  })
  totalSpent: number;

  @ApiProperty({
    description: 'Initially allocated budget',
    example: 50000.0,
  })
  allocatedBudget: number;
}

export class EmotionalTouchInsights {
  @ApiProperty({
    description: 'Total number of well-wishes and messages received',
    example: 87,
  })
  totalWellWishes: number;

  @ApiProperty({
    description: 'Total number of photos uploaded',
    example: 342,
  })
  totalPhotos: number;

  @ApiProperty({
    description: 'Total number of faces detected in photos',
    example: 1256,
  })
  totalFacesDetected: number;

  @ApiProperty({
    description: 'Total number of unique people identified',
    example: 98,
  })
  totalPeopleClusters: number;
}

export class WeddingWrappedResponseDto {
  @ApiProperty({
    description: 'Wedding Wrapped snapshot ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Wedding ID',
    example: 42,
  })
  weddingId: number;

  @ApiProperty({
    description: 'Guest experience insights',
    type: GuestInsights,
  })
  guestInsights: GuestInsights;

  @ApiProperty({
    description: 'Gift and support insights',
    type: GiftSupportInsights,
  })
  giftSupportInsights: GiftSupportInsights;

  @ApiProperty({
    description: 'Planning journey insights',
    type: PlanningJourneyInsights,
  })
  planningJourneyInsights: PlanningJourneyInsights;

  @ApiProperty({
    description: 'Emotional touch insights',
    type: EmotionalTouchInsights,
  })
  emotionalTouchInsights: EmotionalTouchInsights;

  @ApiProperty({
    description: 'When this Wedding Wrapped snapshot was generated',
    example: '2024-06-20T10:30:00Z',
  })
  generatedAt: Date;

  @ApiProperty({
    description: 'When this record was created',
    example: '2024-06-20T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When this record was last updated',
    example: '2024-06-20T10:30:00Z',
  })
  updatedAt: Date;
}
