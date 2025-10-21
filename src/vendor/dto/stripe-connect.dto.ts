import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class StripeConnectAccountResponseDto {
  @IsString()
  accountId: string;

  @IsString()
  accountLinkUrl: string;

  @IsString()
  expiresAt: string;
}

export class StripeAccountStatusDto {
  @IsString()
  accountId: string;

  @IsBoolean()
  chargesEnabled: boolean;

  @IsBoolean()
  payoutsEnabled: boolean;

  @IsBoolean()
  detailsSubmitted: boolean;

  @IsBoolean()
  onboardingComplete: boolean;

  @IsOptional()
  requirements?: {
    currently_due: string[];
    eventually_due: string[];
    past_due: string[];
  };
}

export class CreateAccountLinkDto {
  @IsString()
  vendorId: string;

  @IsOptional()
  @IsString()
  returnUrl?: string;

  @IsOptional()
  @IsString()
  refreshUrl?: string;
}
