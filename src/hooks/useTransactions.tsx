
import { useState, useEffect } from 'react';
import { Transaction, TransactionFormData, TransactionType } from '@/types/transaction';
import { useToast } from '@/components/ui/use-toast';

// Sample initial data
const initialTransactions: Transaction[] = [
  {
    id: '1',
    amount: 2500,
    date: new Date(2023, 3, 1),
    description: 'Salary',
    type: 'income',
  },
  {
    id: '2',
    amount: 800,
    date: new Date(2023, 3, 5),
    description: 'Rent',
    type: 'expense',
  },
  {
    id: '3',
    amount: 120,
    date: new Date(2023, 3, 8),
    description: 'Groceries',
    type: 'expense',
  },
  {
    id: '4',
    amount: 45,
    date: new Date(2023, 3, 12),
    description: 'Dinner',
    type: 'expense',
  },
  {
    id: '5',
    amount: 500,
    date: new Date(2023, 3, 15),
    description: 'Freelance Work',
    type: 'income',
  },
  {
    id: '6',
    amount: 95,
    date: new Date(2023, 3, 18),
    description: 'Utilities',
    type: 'expense',
  },
];

export function useTransactions() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [isLoading, setIsLoading] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const addTransaction = (transactionData: TransactionFormData) => {
    setIsLoading(true);
    try {
      const newTransaction: Transaction = {
        ...transactionData,
        id: Date.now().toString(),
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      toast({
        title: "Success",
        description: "Transaction added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add transaction",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTransaction = (id: string, transactionData: TransactionFormData) => {
    setIsLoading(true);
    try {
      setTransactions(prev => 
        prev.map(transaction => 
          transaction.id === id 
            ? { ...transaction, ...transactionData } 
            : transaction
        )
      );
      setEditingTransaction(null);
      toast({
        title: "Success",
        description: "Transaction updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update transaction",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTransaction = (id: string) => {
    setIsLoading(true);
    try {
      setTransactions(prev => prev.filter(transaction => transaction.id !== id));
      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const cancelEditing = () => {
    setEditingTransaction(null);
  };

  const getMonthlyData = () => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    
    // Initialize data structure to hold monthly totals
    const monthlyData = months.map(month => ({
      name: month,
      income: 0,
      expense: 0
    }));
    
    // Aggregate transactions by month
    transactions.forEach(transaction => {
      const month = transaction.date.getMonth();
      if (transaction.type === 'income') {
        monthlyData[month].income += transaction.amount;
      } else {
        monthlyData[month].expense += transaction.amount;
      }
    });
    
    return monthlyData;
  };

  return {
    transactions,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    editingTransaction,
    startEditing,
    cancelEditing,
    getMonthlyData
  };
}
