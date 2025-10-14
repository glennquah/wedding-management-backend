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

export interface VendorSuspensionData {
  vendorName: string;
  isSuspended: boolean;
  isActive: boolean;
  dashboardUrl: string;
}

export interface AdminSuspensionData {
  adminName: string;
  isSuspended: boolean;
  isActive: boolean;
  dashboardUrl: string;
}

export interface GuestGratitudeCardData {
  guestName: string;
  signOff: string;
  message: string;
  photoUrl: string;
  weddingDate: string;
}

export interface CollaboratorGratitudeCardData {
  collaboratorName: string;
  signOff: string;
  message: string;
  photoUrl: string;
  weddingDate: string;
}

export interface VendorGratitudeCardData {
  vendorName: string;
  signOff: string;
  message: string;
  weddingDate: string;
}

export type EmailTemplateData =
  | PasswordResetData
  | WelcomeEmailData
  | VerifyEmailData
  | CreateAccountData
  | SuccessfulBookingData
  | VendorStatusData
  | AdminStatusData
  | VendorSuspensionData
  | AdminSuspensionData
  | GuestGratitudeCardData
  | CollaboratorGratitudeCardData
  | VendorGratitudeCardData;
