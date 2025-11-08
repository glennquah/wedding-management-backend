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
  resetPasswordUrl: string;
}

export interface RegisterDatingUserData {
  name: string;
  resetPasswordUrl: string;
}

export interface SuperAdminOnboardingData {
  name: string;
  buttonUrl: string;
  dashboardUrl: string;
  supportEmail: string;
}

export interface CollaboratorAddedData {
  name: string;
  weddingName: string;
  inviterName: string;
  loginUrl: string;
}

export interface CalendarAccessRequestData {
  name: string;
  weddingName: string;
  buttonUrl: string;
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

export interface RsvpInvitationData {
  name: string;
  weddingName: string;
  rsvpUrl: string;
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

export interface VendorBookingConfirmationData {
  vendorName: string;
  coupleName: string;
  listingName: string;
  weddingDate: string;
  amount: string;
  orderId: number;
  dashboardUrl: string;
}

export interface VendorBookingRejectionData {
  vendorName: string;
  coupleName: string;
  listingName: string;
  weddingDate: string;
  amount: string;
  orderId: number;
  dashboardUrl: string;
}

export interface DatingPlatformPayoutData {
  partnerName: string;
  commissionId: number;
  payoutDate: string;
  stripeTransferId: string;
  commissionRatePercent: string;
  commissionAmount: string;
  currency: string;
}

export interface VendorListingDeletionData {
  vendorName: string;
  listingName: string;
  dateRemoved: string;
  reasonForRemoval: string;
}

export type EmailTemplateData =
  | PasswordResetData
  | WelcomeEmailData
  | VerifyEmailData
  | CreateAccountData
  | SuperAdminOnboardingData
  | CollaboratorAddedData
  | CalendarAccessRequestData
  | SuccessfulBookingData
  | VendorStatusData
  | AdminStatusData
  | VendorSuspensionData
  | AdminSuspensionData
  | GuestGratitudeCardData
  | CollaboratorGratitudeCardData
  | VendorGratitudeCardData
  | RsvpInvitationData
  | VendorBookingConfirmationData
  | VendorBookingRejectionData
  | RegisterDatingUserData
  | DatingPlatformPayoutData
  | VendorListingDeletionData;
