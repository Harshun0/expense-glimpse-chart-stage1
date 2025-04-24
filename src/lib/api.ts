import { Transaction, TransactionFormData } from '@/types/transaction';

// Base URL for the API
const API_URL = '/api';

// Function to handle HTTP requests
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'An error occurred');
  }

  return response.json();
}

// API functions for transactions
export const TransactionAPI = {
  // Get all transactions
  getAll: async (): Promise<Transaction[]> => {
    const data = await fetchAPI<{ transactions: Transaction[] }>('/transactions', {
      method: 'GET',
    });
    
    // Convert string dates to Date objects
    return data.transactions.map(transaction => ({
      ...transaction,
      date: new Date(transaction.date),
    }));
  },

  // Add a new transaction
  add: async (transaction: TransactionFormData): Promise<Transaction> => {
    const data = await fetchAPI<{ transaction: Transaction }>('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
    
    return {
      ...data.transaction,
      date: new Date(data.transaction.date),
    };
  },

  // Update an existing transaction
  update: async (id: string, transaction: TransactionFormData): Promise<Transaction> => {
    const data = await fetchAPI<{ transaction: Transaction }>(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transaction),
    });
    
    return {
      ...data.transaction,
      date: new Date(data.transaction.date),
    };
  },

  // Delete a transaction
  delete: async (id: string): Promise<void> => {
    await fetchAPI<void>(`/transactions/${id}`, {
      method: 'DELETE',
    });
  },
}; 