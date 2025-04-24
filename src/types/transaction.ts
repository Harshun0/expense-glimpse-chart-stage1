
export interface Transaction {
  id: string;
  amount: number;
  date: Date;
  description: string;
  type: TransactionType;
}

export type TransactionType = 'income' | 'expense';

export interface TransactionFormData {
  amount: number;
  date: Date;
  description: string;
  type: TransactionType;
}
