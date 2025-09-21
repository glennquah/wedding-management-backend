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

export type EmailTemplateData =
  | PasswordResetData
  | WelcomeEmailData
  | VerifyEmailData
  | CreateAccountData;
