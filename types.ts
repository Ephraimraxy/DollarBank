export enum ViewState {
  SIGN_IN = 'SIGN_IN',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
  REVERIFY = 'REVERIFY',
  VERIFY_EMAIL = 'VERIFY_EMAIL',
  VERIFY_OTP = 'VERIFY_OTP',
  RESET_PASSWORD = 'RESET_PASSWORD',
  HOME = 'HOME',
  TRANSFER = 'TRANSFER',
  CARDS = 'CARDS',
  INVEST = 'INVEST',
  ACTIVITY = 'ACTIVITY',
  NOTIFICATIONS = 'NOTIFICATIONS',
  FEE_PAYMENT = 'FEE_PAYMENT',
  PROFILE = 'PROFILE',
  REQUEST = 'REQUEST',
  SUPPORT = 'SUPPORT',
  LIVE_CHAT = 'LIVE_CHAT',
  ADMIN = 'ADMIN'
}

export interface Transaction {
  id: string;
  recipientName: string;
  amount: number;
  date: string;
  status: 'Completed' | 'Pending' | 'Failed';
  reference: string;
}

export interface Account {
  name: string;
  number: string;
  balance: number;
  type: 'Checking' | 'Savings';
}