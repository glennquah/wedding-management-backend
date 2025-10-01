import { VendorOnboardingStatus } from 'src/common/vendor-onboarding-status.enum';

export interface PasswordResetData {
  name: string;
  buttonUrl: string;
}

export interface WelcomeEmailData {
  userName: string;
  dashboardUrl: string;
}

export interface VerifyEmailData {
  name: string;
  verifyUrl: string;
}

export interface CreateAccountData {
  name: string;
  weddingName: string;
  inviterName: string;
  signupUrl: string;
}

export interface SuccessfulBookingData {
  vendorName: string;
  serviceType: string;
  eventDate: string;
  bookingDate: string;
  totalAmount: string;
  status: string;
  dashboardUrl: string;
}

export interface VendorStatusData {
  vendorName: string;
  vendorOnboardingStatus: VendorOnboardingStatus;
  dashboardUrl: string;
  isPending?: boolean;
  isRejected?: boolean;
  isOnboarded?: boolean;
}

export interface AdminStatusData {
  adminName: string;
  adminStatus: 'suspended' | 'active';
  adminDashboardUrl: string;
  isSuspended?: boolean;
  isActive?: boolean;
  suspensionReason?: string;
  suspensionDuration?: string;
  reactivationNote?: string;
}

export type EmailTemplateData =
  | PasswordResetData
  | WelcomeEmailData
  | VerifyEmailData
  | CreateAccountData
  | SuccessfulBookingData
  | VendorStatusData
  | AdminStatusData;
