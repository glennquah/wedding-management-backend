export interface PasswordResetData {
  name: string;
  buttonUrl: string;
}

export interface WelcomeEmailData {
  userName: string;
  dashboardUrl: string;
}

export type EmailTemplateData = PasswordResetData | WelcomeEmailData;
