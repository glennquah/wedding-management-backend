import { ApiProperty } from '@nestjs/swagger';

export class DatingPartnerCommissionResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  adminId: number;

  @ApiProperty()
  orderId: number;

  @ApiProperty()
  listingId: number;

  @ApiProperty()
  grossAmount: number;

  @ApiProperty()
  commissionRate: number;

  @ApiProperty()
  commissionAmount: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  status: string;

  @ApiProperty({ nullable: true })
  stripeTransferId?: string;

  @ApiProperty({ nullable: true })
  failureReason?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class AdminInfoDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;
}

export class AdminDetailsDto {
  @ApiProperty()
  userId: number;

  @ApiProperty({ type: AdminInfoDto })
  user: AdminInfoDto;
}

export class AllDatingPartnerCommissionResponseDto extends DatingPartnerCommissionResponseDto {
  @ApiProperty({ type: AdminDetailsDto })
  admin: AdminDetailsDto;
}
