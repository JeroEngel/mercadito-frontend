export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  balance: number;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  type: 'send' | 'receive' | 'debin' | 'load';
  recipientEmail?: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  Transfer: undefined;
  TransactionHistory: undefined;
  Contacts: undefined;
}; 